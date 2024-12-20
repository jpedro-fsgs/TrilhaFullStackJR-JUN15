//importa a função pra receber o array de projetos
import { importProjetosPublicos } from "../data/data.js";
import { slideDownAnchor } from "../main.js";
import { linkIcon } from "./ui_adicionar_projetos.js";

//elementos da página de exibição
const projetoView = $("#view"); 
const listaProjetos = $("#lista-projetos");
const titulo = $("#titulo-lista");
// const sidebar = $("#sidebar");

const userIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
        <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
    </svg>`;

export const concluidoIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
    </svg>`;

export const concluidoInfo = `
    <span class="badge text-bg-success">
        ${concluidoIcon}
        Projeto Concluído
    </span>`;

//criação da página com informações de cada projeto
function criarPaginaProjeto(nome, descricao, prazo, criacao, usuario, link, is_concluido) {
    projetoView.empty();
    
    const dateCriacao = new Date(criacao);
    const datePrazo = new Date(prazo);

    //formatação das datas para horário e localização em pt-BR
    const labelCriacao = `Criado: ${dateCriacao.toLocaleDateString('pt-BR')}`;
    const labelPrazo = prazo ? `Prazo: ${datePrazo.toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : "";
    const labelLink = link ? `
    <span>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
        </svg>
        <a href="${link}" rel="noopener noreferrer" target="_blank" class="lead text-break">${link}</a>
    </span>` : "";

    //criação do container com as informações do projeto
    const projetoViewBox = $(
        `<div class="container my-5">
            <div class="p-5 text-center bg-body-tertiary rounded-3">
                <div id="horario" class="text-muted d-flex flex-wrap-reverse flex-sm-wrap justify-content-between">
                    <span class="d-flex" style="gap:10px;">
                        <span>${is_concluido ? concluidoInfo : ""}</span>
                        <p>${is_concluido ? "" : labelPrazo}</p>
                        <p>${labelCriacao}</p>
                    </span>
                    
                    <span class="d-flex" style="gap:10px;">
                        ${userIcon}
                        ${usuario}
                    </span>
                </div>
                
                <h1 class="text-body-emphasis mb-4">${nome}</h1>
                ${labelLink}
                <p class="lead mt-4">${descricao ? descricao : ""}</p>
            </div>
        </div>`);

    //append do container na caixa de exibição
    projetoView.append(projetoViewBox);

}

//Essa função recebe a data do prazo e retorna um texto simples indicando o tempo restante
export function tempoRestante(prazo){
    
    if(!prazo){
        return "";
    }
    
    const nowDate = Date.now()
    const prazoDate = Date.parse(prazo + "T23:59:59");

    const dataDoPrazo = new Date(prazoDate);
    const dataDeAgora = new Date(nowDate);
    // dataDoPrazo.setHours(23, 59, 59);
    // dataDeAgora.setHours(0, 0, 0);

    const diferencaDias = Math.floor((dataDoPrazo.getTime() - dataDeAgora.getTime()) / (1000 * 60 * 60 * 24));

    if(diferencaDias < 0){
        return "Vencido";
    }

    //retorna o ano do prazo, caso não seja o ano atual
    if(dataDoPrazo.getFullYear() > dataDeAgora.getFullYear()){
        return dataDoPrazo.getFullYear()
    }
    //retorna o mês do prazo, caso não seja o mês atual
    if(dataDoPrazo.getMonth() > dataDeAgora.getMonth() && diferencaDias > 7){
        return dataDoPrazo.toLocaleDateString('default', {month: "short"}, { timeZone: 'UTC'})
    }

    //retorna o número dias
    if(diferencaDias > 1){
        return diferencaDias + " dias";
    }
    
    if(diferencaDias == 1){
        return "Amanhã";
    }
    
    if(diferencaDias == 0){
        return "Hoje";
    }
    return undefined;
}

//função que cria um item da lista , que mostra as informações do projeto ao ser clicado
function criarItemLista(id, nome, descricao, prazo, criacao, usuario, link, is_concluido) {

    const itemLista = $(`<a id="${id}" role="button" class="list-group-item list-group-item-action py-3 lh-sm" aria-current="true">
                            <div class="d-flex w-100 align-items-center justify-content-between">
                                <span class="d-flex">
                                    <span class="d-flex flex-column mb-1 px-2">
                                        <strong class="">${nome}</strong>
                                        <small>${usuario}</small>
                                    </span>
                                    ${link ? linkIcon : ""}
                                </span>
                                <small>${is_concluido ? concluidoIcon : tempoRestante(prazo)}</small>
                            </div>
                        </a>`);

    itemLista.on("click", () => {
        criarPaginaProjeto(nome, descricao, prazo, criacao, usuario, link, is_concluido);
    })
    return itemLista;
}

function sortProjetosPublicos(a, b){
    if (a.is_concluido !== b.is_concluido) return a.is_concluido ? -1 : 1;
    
    const agora = new Date();
    const aPrazo = new Date(a.prazo + "T23:59:59");
    const bPrazo = new Date(b.prazo + "T23:59:59");

    if((aPrazo < agora) !== (bPrazo < agora)) return aPrazo < agora ? 1 : -1;
    if(!a.prazo !== !b.prazo) return !a.prazo ? 1 : -1;

    return aPrazo - bPrazo;
}

//cria toda página de exibição do projeto, chamada ao clicar na aba Projetos
export async function showProjetosPublicos() {
    
    
    let projetos = importProjetosPublicos();
    listaProjetos.empty();
    projetoView.empty();
    titulo.empty();
    
    //antes de um projeto ser seleciona, mostra "Selecione um projeto" na caixa de informação
    const projetoViewBox = $(
        `<div class="container my-5">
            <div class="p-5 text-center bg-body-tertiary rounded-3">
                <h1 class="text-body-emphasis">Selecione um Projeto</h1>
            </div>
        </div>`);
    //caso não haja projetos, mostra "Adicione um Projeto"
    const mensagemAdicionarBox = projetoViewBox.find("h1")
    if(!projetos.length){
        mensagemAdicionarBox.text("Adicione um Projeto");
        mensagemAdicionarBox.on("click", () => {
            $("#adicionar").click();
        });
    }
    projetoViewBox.on("click", () => {
        slideDownAnchor();
    })
    projetoView.append(projetoViewBox);
    
    //ícone e título da lista
    const icon = $(`
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-globe-americas" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484q-.121.12-.242.234c-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 1 2.04 4.327Z"/>
        </svg>`)

    titulo.append(icon);
    titulo.append(`<h3>Projetos Públicos<h3>`);


    //cria um item da lista pra cada projeto armazenado no array de projetos
    projetos.sort(sortProjetosPublicos).forEach(projeto => {

        const itemLista = criarItemLista(projeto.id, projeto.nome, projeto.descricao, projeto.prazo, projeto.criacao, projeto.usuario, projeto.link, projeto.is_concluido);
        itemLista.on("click", () => {
            $(".list-group-item").removeClass("active");
            itemLista.addClass("active");
        })
        listaProjetos.append(itemLista);
    });
}