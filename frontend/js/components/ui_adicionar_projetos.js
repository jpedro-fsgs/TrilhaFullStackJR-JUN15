//importação das funções para adicionar um projeto, receber a lista de projetos,
//e setar o array de projetos global
import { addProjeto, importMeusProjetos, setMeusProjetos, setProjetosPublicos } from "../data/data.js";
//função que recebe uma data e retorna uma indicação simples do prazo
import { concluidoIcon, tempoRestante } from "./ui_pagina_projetos_publicos.js";
import { sortMeusProjetos } from "./ui_pagina_meus_projetos.js";

//ícone de público e privado
import { isPublicoIcon } from "./ui_pagina_meus_projetos.js";

import { slideDownAnchor } from "../main.js";

//elementos da página de exibição
const projetoView = $("#view");
const listaProjetos = $("#lista-projetos");
const titulo = $("#titulo-lista");

//seção onde será mostrado o formulário para adicionar
const projetoViewBox = $(`<div class="container my-5"></div>`);
//container dentro da seção que será inserido o formulário
const projetoViewBoxText = $(`<div id="view-box-text" class="p-4 text-center bg-body-tertiary rounded-3"></div>`);

export const linkIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
    </svg>`;

//formulário para adicionar novo projeto
const adicionarFormBase = $(`
    <form id="add-projeto-form">
        <span class="d-flex justify-content-between">
            <select id="is-publico" class="form-select form-select-sm" style="width: 95px;" aria-label="Default select example">
                <option value="privado" selected>Privado</option>
                <option value="publico">Público</option>
            </select>
            <span class="check-remove">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckConcluido">
                <label class="form-check-label" for="flexCheckConcluido">&nbsp;&nbsp;Concluído</label>
            </span>
        </span>
        <h1 class="text-body-emphasis mb-5">Adicionar Projeto</h1>
        <div class="form-floating mb-3">
            <input required type="text" class="form-control" id="floatingNomeProjeto" placeholder="Nome do Projeto">
            <label for="floatingNomeProjeto">Nome do Projeto</label>
        </div>
        <div class="input-group input-group-sm mb-3">
            <span class="input-group-text" id="inputGroup-sizing-sm">${linkIcon}</span>
            <input type="url" id="linkProjeto" placeholder="(opcional) https://exemplo.com" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
        </div>
        <div class="form-floating mb-3">
            <textarea class="form-control" rows="10" style="height:100%" id="floatingDescricao" placeholder="Descrição do Projeto"></textarea>
            <label for="floatingDescricao">Descrição do Projeto (opcional)</label>
        </div>
        <div class="form-check">
            <span class="check-remove">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckPrazo">
                <label class="form-check-label" for="flexCheckPrazo">&nbsp;&nbsp;Incluir prazo</label>
            </span>
        </div>
        <div class="form-floating">
            <input type="date" class="form-control" id="floatingPrazo">
            <label for="floatingPrazo">Prazo do Projeto</label>
        </div>
        <button id="botao-submit" type="submit" class="btn btn-primary mt-4">Adicionar Projeto</button>
    </form>`)


//função que cria um item da lista, o item não é clicável e é indicado como desativado
function criarItemLista(id, nome, prazo, is_publico, link, is_concluido) {

    const itemLista = $(`<a id="${id}" role="button" class="disabled list-group-item list-group-item-action py-3 lh-sm" aria-current="true">
                            <div class="d-flex w-100 align-items-center justify-content-between">
                                <span class="d-flex">
                                    <span>
                                        ${isPublicoIcon[Number(is_publico)]}
                                        <strong class="mb-1 px-2">${nome}</strong>
                                    </span>
                                    ${link ? linkIcon : ""}
                                </span>
                                <small>${is_concluido ? concluidoIcon : tempoRestante(prazo)}</small>
                            </div>
                        </a>`);

    return itemLista;
}

//função que recebe o array de projetos e usa criarItemLista para criar cada um e dar append no elemento da lista
function criarListaProjetos(projetos){
    listaProjetos.empty();
    projetos.sort(sortMeusProjetos).forEach(projeto => {
        const itemLista = criarItemLista(projeto.id, projeto.nome, projeto.prazo, projeto.is_publico, projeto.link, projeto.is_concluido);
        listaProjetos.append(itemLista);
    });
}

//cria toda página de edição dos projetos, chamada ao clicar na aba Adicionar
export function showAdicionarProjeto() {
    
    //recebe o atual array de projetos
    let projetos = importMeusProjetos();
    
    const adicionarForm = adicionarFormBase.clone()
    //atribui os elementos do formulário
    const inputNomeProjeto = adicionarForm.find("#floatingNomeProjeto");
    const inputDescricaoProjeto = adicionarForm.find("#floatingDescricao");
    const inputLinkProjeto = adicionarForm.find("#linkProjeto");
    const inputCheckPrazo = adicionarForm.find("#flexCheckPrazo");
    const inputPrazo = adicionarForm.find("#floatingPrazo");
    const inputIsPublico = adicionarForm.find("#is-publico");
    const inputIsConcluido = adicionarForm.find("#flexCheckConcluido");
    
    titulo.empty();
    listaProjetos.empty();
    projetoView.empty();
    projetoViewBoxText.empty()
    projetoView.off();

    // append do formulário no container de texto
    projetoViewBoxText.append(adicionarForm);

    //append do container de texto ao container principal
    projetoViewBox.append(projetoViewBoxText);
    
    //append do container principal à seção de informações
    projetoView.append(projetoViewBox);

    //ícone e título da lista
    const icon = $(`
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-journal-plus" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"/>
        <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
        <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
    </svg>`)
    
    titulo.append(icon);
    titulo.append(`<h3>Adicionar Projetos<h3>`);

    //chama a função de criação da lista
    criarListaProjetos(projetos);

    //inicia o input de data desativado
    inputPrazo.attr("disabled", true);
    //atribui data mínima ao dia corrente, new Date().toLocaleDateString('fr-ca') retorna a data atual no formato aceito
    inputPrazo.attr("min", new Date().toLocaleDateString('fr-ca'));
    
    //ativa e desativa o input de data, de acordo com o checkbox
    inputCheckPrazo.on("change", event => {
        const elemento = event.target;
        if(elemento.checked){
            inputPrazo.attr("disabled", false);
        }
        else{
            inputPrazo.attr("disabled", true);
        }
    });

    //ação acionada ao enviar o formulário
    adicionarForm.on("submit", async(e) => {
        e.preventDefault();
        const nome = inputNomeProjeto.val();
        const link = inputLinkProjeto.val() !== "" ? inputLinkProjeto.val() : null;
        const descricao = inputDescricaoProjeto.val() !== "" ? inputDescricaoProjeto.val() : null;
        //atribui o prazo caso o checkbox esteja marcado, atribui null caso contrário
        const prazo = inputCheckPrazo.is(":checked") && inputPrazo.val() ? new Date(inputPrazo.val() + "T23:59:59.999Z") : null;
        const is_publico = inputIsPublico.val() == "publico" ? true : false;
        const is_concluido = inputIsConcluido.is(":checked");
        
        //cria um objeto com os atributos
        const novoProjeto = {
            nome,
            ...(descricao && {descricao}),
            ...(link && {link}),
            ...(prazo && {prazo}),
            is_publico,
            is_concluido
        }
        //envia o objeto como parametro para ser adicionado, e armazena o retorno
        const atualizacaoProjetos = await addProjeto(novoProjeto);
        //a chave "projetos" contém o array de projetos atualizado
        criarListaProjetos(atualizacaoProjetos.userProjects);
        setMeusProjetos(atualizacaoProjetos.userProjects);
        setProjetosPublicos(atualizacaoProjetos.publicProjects)

        projetoViewBoxText.empty()
        projetoViewBoxText.append(`
            <div class="alert alert-success" role="alert">
                ${nome} Adicionado!
            </div>`);
        const adicionarNovo = $(`<button type="button" class="btn btn-primary">Adicionar novo projeto</button>`);
        adicionarNovo.on("click", () => {
            showAdicionarProjeto();
        })
        projetoViewBoxText.append(adicionarNovo);


        //ao adicionar um novo projeto, a lista de projetos é rolada até o final pra mostrar o novo projeto
        slideDownAnchor();
        listaProjetos[0].scrollTop = listaProjetos[0].scrollHeight;

    });
}