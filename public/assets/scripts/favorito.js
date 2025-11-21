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


//***FUNÇÃO PARA RETORNAR O ID DO USUÁRIO COM STATUS == TRUE*/

async function BuscarIDUsuarioLogado() {
    try {
        const response = await fetch('http://localhost:3000/usuarios');
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar JSON: ${response.status}`);
        }

        const dados = await response.json();

        const usuarioAtivo = dados.find(item => item.Status === true);
        return usuarioAtivo ? usuarioAtivo.ID : null;

    } catch (error) {
        console.error("Falha CRÍTICA ao carregar o arquivo usuario.json:", error);
        return null;
    }
}

//**FUNÇÃO PARA RETORNAR UM ARRAY DE ID DE PRODUTOS***/

async function BuscarArrayDeProdutos() {
    try {
        const response = await fetch('http://localhost:3000/favoritos');
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar JSON: ${response.status}`);
        }

        const dados = await response.json();
        let id = await BuscarIDUsuarioLogado();
        const ArrayIDDeProdutos = dados.find(item => item.ID_Usuario === id);
        
        return ArrayIDDeProdutos ? ArrayIDDeProdutos : null;

    } catch (error) {
        console.error("Falha CRÍTICA ao carregar o arquivo favoritos.json:", error);
        return null;
    }
}

//***LINHA DE CÓDIGO JAVA SCRIPT***
// Roda o código principal depois que a página favoritos carrega
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


    //const produtosFiltrados = produtos.filter(produto => idsFavoritos.includes(produto.id));
    let objetoFavoritos = await BuscarArrayDeProdutos();
    let idsFavoritos = objetoFavoritos.produtosFavoritos;
    
    
   
    let dadosFiltradosFavoritos;
    

    if (idsFavoritos.length > 0) {
        dadosFiltradosFavoritos = dados.filter(produto => idsFavoritos.some(item => item.ID_Produto == produto.id))   
     
    } else {
        dadosFiltradosFavoritos = null;
    }

  
   

    // Monta a página pela primeira vez com todos os produtos
    montarPaginaFavoritos(dadosFiltradosFavoritos);
});


//***FUNÇÃO PARA RENDERIZAR OS DADOS em FAVORITOS***
// Função que monta a página (agora ela pode receber uma lista filtrada)
function montarPaginaFavoritos(dadosParaRenderizar) {
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

                        <ul class="navbar-nav d-flex flex-row align-items-center">
                            <!--Icone de Carrinho-->
                            <li class="nav-item dropdown me-2">
                            <a class="nav-link" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-cart" style="color:#6d1e0d"></i>
                            </a>
                            </li>
                        
                            <!--Icone de Lixeira-->
                            <li class="nav-item dropdown">
                            <a class="nav-link" onclick="DeletarProdutofavorito(${item.id})"  id="navbarDropdown" role="button" data-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-trash" style="color:#6d1e0d"></i>
                            </a>
                            </li>
                        </ul>
                        <a href="${linkDetalhes}" style="background-color: #6d1e0d; border-color: white;" class="btn btn-primary mt-auto">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

//***FUNÇÃO PARA EXCLUIR PRODUTO FAVORITADO***/

async function DeletarProdutofavorito(idP) {
    try {
       
        let idFavorito = await BuscarArrayDeProdutos();
        let idF = idFavorito.id;

    
        if (!confirm(`Tem certeza que deseja REMOVER o produto da tela de favorito?`)) {
            return; 
        }

      
        const response = await fetch(`http://localhost:3000/favoritos/${idF}`);
        const data = await response.json();

        const novosFavoritos = data.produtosFavoritos.filter(p => p.ID_Produto !== idP);

        
        const updateURL = `http://localhost:3000/favoritos/${idF}`;

        
        const updateResponse = await fetch(updateURL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, produtosFavoritos: novosFavoritos })
        });

        const updatedData = await updateResponse.json();
        console.log('Produto removido com sucesso:', updatedData);
        location.reload(true);
    } catch (error) {
        console.error('Erro ao remover o produto:', error);
    }
}









