from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from sqlalchemy import asc, case, desc, nulls_last
from routes.auth import get_current_usuario
from models.projects import MultProjetosInput, ProjetoDelete, ProjetoInput, ProjetoUpdate, ProjetosDelete
from database.schema import Projeto, get_session, Session
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get('/')
async def get_projetos_publicos(session: Session = Depends(get_session)):
    data_atual = datetime.now().date()
    
    projetos = (
        session.query(Projeto)
        .options(joinedload(Projeto.usuario))
        .filter(Projeto.is_publico)
        .order_by(
            desc(Projeto.is_concluido),
            case(
                (Projeto.prazo == None, 2),
                (Projeto.prazo > data_atual, 0),
                else_=1
            ),
            asc(Projeto.prazo),
            nulls_last(Projeto.prazo)
        )
        .all()
    )
    
    if projetos: 
        return [{
            "id": projeto.id,
            "criacao": projeto.criacao,
            "nome": projeto.nome,
            "link": projeto.link,
            "descricao": projeto.descricao,
            "prazo": projeto.prazo,
            "usuario": projeto.usuario.username,
            "is_concluido": projeto.is_concluido
        } for projeto in projetos]
    
    return []

@router.get('/usuario')
async def get_projetos_usuario(user: Annotated[dict, Depends(get_current_usuario)], session: Session = Depends(get_session)):
    projetos = session.query(Projeto).filter(Projeto.usuario_id == user["id"]).order_by(desc(Projeto.criacao)).all()
    
    if projetos: 
        return projetos
    
    return []

async def get_projetos_atualizacao(user: Annotated[dict, Depends(get_current_usuario)], session: Session = Depends(get_session)):
    return {
        "meus_projetos": await get_projetos_usuario(user, session),
        "projetos_publicos": await get_projetos_publicos(session),
        "usuario": user
    }

@router.post('/criar')
async def registrar_projeto(user: Annotated[dict, Depends(get_current_usuario)], projeto_input: ProjetoInput, session: Session = Depends(get_session)):
    if(not projeto_input.nome.strip()):
       raise HTTPException(status_code=422, detail='O nome do projeto não pode ser vazio')
    
    if(projeto_input.prazo and projeto_input.prazo < datetime.now(timezone.utc)):
        raise HTTPException(status_code=422, detail='O prazo já está vencido')
    
    projeto = Projeto(nome=projeto_input.nome.strip(),
                      descricao=projeto_input.descricao,
                      link=projeto_input.link,
                      prazo=projeto_input.prazo,
                      is_publico=projeto_input.is_publico,
                      is_concluido = projeto_input.is_concluido,
                      usuario_id=user["id"])
    session.add(projeto)
    session.commit()
    
    return await get_projetos_atualizacao(user, session)

@router.post('/criar_varios')
async def registrar_multiplos_projetos(user: Annotated[dict, Depends(get_current_usuario)], projetos_input: MultProjetosInput, session: Session = Depends(get_session)):
    
    projetos_inseridos = []
    projetos_com_erro = []
    
    for projeto_input in projetos_input.projetos:
        try:
            if(not projeto_input.nome.strip()):
                raise HTTPException(status_code=422, detail='Não pode haver nome de projeto vazio')
            
            projeto = Projeto(nome=projeto_input.nome.strip(),
                              descricao=projeto_input.descricao,
                              link=projeto_input.link,
                              prazo=projeto_input.prazo,
                              is_publico=projeto_input.is_publico,
                              is_concluido = projeto_input.is_concluido,
                              usuario_id=user["id"])
            session.add(projeto)
            session.commit()
            
            projetos_inseridos.append({
                "id": projeto.id,
                "projeto": projeto.nome
            })
        except HTTPException as erro:
            projetos_com_erro.append({
                "projeto": projeto_input.nome,
                "erro": str(erro.detail)
            })

    projetos = await get_projetos_atualizacao(user, session)
    return {
        "projetos inseridos": projetos_inseridos,
        "projetos com erro": projetos_com_erro if projetos_com_erro else 0,
        "projetos": projetos
        }

@router.put('/editar')
async def alterar_projeto(user: Annotated[dict, Depends(get_current_usuario)], projeto_update: ProjetoUpdate, session: Session = Depends(get_session)):
    projeto = session.query(Projeto).filter(projeto_update.id == Projeto.id, Projeto.usuario_id == user["id"]).first()
    
    if not projeto:
        raise HTTPException(status_code=404, detail='Projeto não encontrado')
    if projeto_update.nome != None:
        projeto.nome = projeto_update.nome.strip()
    if projeto_update.descricao != None:
        projeto.descricao = projeto_update.descricao
    if projeto_update.link != None:
        projeto.link = projeto_update.link
    
    projeto.prazo = projeto_update.prazo

    if projeto_update.is_publico != None:
        projeto.is_publico = projeto_update.is_publico
    if projeto_update.is_concluido != None:
        projeto.is_concluido = projeto_update.is_concluido
    
    session.add(projeto)
    session.commit()
    

    projetos = await get_projetos_atualizacao(user, session)
    return {
        "projeto atualizado":{
            "id": projeto.id,
            "nome": projeto.nome,
            "descricao": projeto.descricao
            },
        "projetos": projetos
        }

    

@router.delete('/deletar')
async def remover_projeto(user: Annotated[dict, Depends(get_current_usuario)], projeto_delete: ProjetoDelete, session: Session = Depends(get_session)):
    projeto = session.query(Projeto).filter(projeto_delete.id == Projeto.id, Projeto.usuario_id == user["id"]).first()
    if not projeto:
        raise HTTPException(status_code=404, detail='Projeto não encontrado')

    session.delete(projeto)
    session.commit()


    projetos = await get_projetos_atualizacao(user, session)
    return {"deletado": projeto.nome,
            "projetos ": projetos}

@router.delete('/deletar_varios')
async def remover_multiplos_projetos(user: Annotated[dict, Depends(get_current_usuario)], projeto_delete: ProjetosDelete, session: Session = Depends(get_session)):
    projetos_deletados = []
    projetos_nao_encontrados = []

    for id in projeto_delete.ids:
        try:
            projeto = session.query(Projeto).filter(id == Projeto.id, Projeto.usuario_id == user["id"]).first()
            if not projeto:
                raise HTTPException(status_code=404, detail='Projeto não encontrado')
        
            session.delete(projeto)
            session.commit()
            projetos_deletados.append(projeto.nome)

        except HTTPException:
            projetos_nao_encontrados.append(id)

    projetos = await get_projetos_atualizacao(user, session)
    return {
        "projetos deletados": projetos_deletados,
        "projetos não encontrados": projetos_nao_encontrados if projetos_nao_encontrados else [],
        "projetos": projetos
        }
