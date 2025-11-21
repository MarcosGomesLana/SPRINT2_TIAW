//***FUNÇÃO QUE BUSCA OS DADAOS POR REQUISIÇÃO HTTP***
async function buscarDados() {
    try {
        const response = await fetch('http://localhost:3000/produtos');
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar JSON: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Falha CRÍTICA ao carregar o arquivo produtos.json:", error);
        return null;
    }
}

//***LINHA DE CÓDIGO JAVA SCRIPT***
// Roda o código principal depois que a página carrega
document.addEventListener('DOMContentLoaded', async () => {
    const loadingDiv = document.getElementById('loading');
    const containerLista = document.getElementById('lista-produtos');
    const filtroCategoria = document.getElementById('categoryFilter'); // Pega o elemento do filtro

    // Mostra o "Carregando..."
    if (loadingDiv) loadingDiv.style.display = 'block';

    const dados = await buscarDados();
    
    // Esconde o "Carregando..."
    if (loadingDiv) loadingDiv.style.display = 'none';

    if (!dados) {
        if (containerLista) containerLista.innerHTML = '<div class="alert alert-danger text-center">Erro ao carregar produtos. Verifique o console (F12).</div>';
        return;
    }


    
    
    let dadosFiltradosHome;
    if (dados.some(item => item.PrecoComDesconto < 10)){
        dadosFiltradosHome = dados.filter(item => item.PrecoComDesconto < 10);
    }else{
        dadosFiltradosHome = dados;
    }
  
   

    // Monta a página pela primeira vez com todos os produtos
    montarPaginaHome(dadosFiltradosHome);
});


//***FUNÇÃO PARA RENDERIZAR OS DADOS NA HOMEPAGE***
// Função que monta a página (agora ela pode receber uma lista filtrada)
function montarPaginaHome(dadosParaRenderizar) {
    const containerLista = document.getElementById('lista-produtos');
    const noResultsDiv = document.getElementById('noResults');
    if (!containerLista || !noResultsDiv) return;

    // Se a lista de dados para renderizar estiver vazia, mostra a mensagem "Nenhum produto"
    if (dadosParaRenderizar.length === 0) {
        containerLista.innerHTML = ''; // Limpa a lista de produtos
        noResultsDiv.style.display = 'block'; // Mostra a mensagem
        return;
    }

    // Se houver produtos, esconde a mensagem e monta os cards
    noResultsDiv.style.display = 'none';
    containerLista.innerHTML = dadosParaRenderizar.map(item => {
        const caminhoImagem = `assets/img/${item.imagem}`; 
        const linkDetalhes = `detalhes.html?id=${item.id}`; // Link temporário

        return `
            <div class="col-12 col-md-6 col-lg-3 mb-4">
                <div class="card h-100">
                    <a href="${linkDetalhes}">
                        <img src="${caminhoImagem}" class="card-img-top" alt="${item.nome}" style="height: 200px; object-fit: contain; padding: 10px;">
                    </a>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.nome}</h5>
                        <h6><s>R$ ${item.PrecoOriginal}</s></h6>
                        <h5 style="color:#1d7553"><strong>R$ ${item.PrecoComDesconto}</strong></h5>
                        <h6 style="color:#1d7553"><strong>${item.DataValidade}</strong></h6>
                        <a href="${linkDetalhes}" style="background-color: #6d1e0d; border-color: white;" class="btn btn-primary mt-auto">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
