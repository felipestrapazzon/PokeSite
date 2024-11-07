const pokemonList = document.getElementById('pokemon-list');
const loadMoreButton = document.createElement('button');
loadMoreButton.textContent = 'Carregar Mais Pokémon';
loadMoreButton.classList.add('load-more-button');
loadMoreButton.addEventListener('click', loadMorePokemon);

let allPokemon = []; // Array completo dos Pokémon para pesquisa
let displayedPokemon = []; // Array dos Pokémon exibidos na tela
let currentOffset = 0;
const limitPerLoad = 12; // Quantidade de Pokémon carregados por vez

const tiposPokemon = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Planta",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Venenoso",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

function traduzirTipo(tipoIngles) {
    return tiposPokemon[tipoIngles] || tipoIngles;
}

async function fetchPokemonDetails(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemon = await response.json();

    const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    const tipoEmPortugues = traduzirTipo(pokemon.types[0].type.name);

    return {
        id: pokemon.id,
        name: pokemon.name,
        image: image,
        type: tipoEmPortugues
    };
}

function createPokemonCard(pokemon) {
    const pokemonCard = document.createElement('a');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.href = `pokemon.html?id=${pokemon.id}`;
    pokemonCard.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}">
        <p class="pokemon-id">Nº ${String(pokemon.id).padStart(4, '0')}</p>
        <h2>${pokemon.name}</h2>
        <div class="types">
            <p class="type type-${pokemon.type}">${pokemon.type}</p>
        </div>
    `;
    return pokemonCard;
}

function displayPokemon(pokemonArray) {
    pokemonList.innerHTML = ''; // Limpa a lista antes de exibir

    pokemonArray.forEach((pokemon, index) => {
        const pokemonCard = createPokemonCard(pokemon);
        pokemonCard.style.setProperty('--pokemon-index', index % limitPerLoad);
        pokemonList.appendChild(pokemonCard);
    });

    // Adiciona o botão "Carregar Mais" apenas se não estiver no modo de pesquisa
    if (!document.getElementById('search').value && !pokemonList.contains(loadMoreButton)) {
        pokemonList.appendChild(loadMoreButton);
    }
}

// Carrega todos os Pokémon para a pesquisa, mas exibe apenas os primeiros 12
async function preloadAllPokemon(limit = 1025) {
    for (let i = 1; i <= limit; i++) {
        const pokemon = await fetchPokemonDetails(i);
        allPokemon.push(pokemon);
    }
    loadMorePokemon(); // Carrega o primeiro lote para exibição inicial
}

// Função para carregar mais Pokémon ao clicar no botão "Carregar Mais"
function loadMorePokemon() {
    currentOffset += limitPerLoad;
    displayedPokemon = allPokemon.slice(0, currentOffset);
    displayPokemon(displayedPokemon);
}

// Função de pesquisa
function filterPokemon() {
    const searchQuery = document.getElementById('search').value.toLowerCase();

    if (searchQuery) {
        // Filtra os Pokémon de acordo com a consulta de pesquisa
        const filteredPokemon = allPokemon.filter(pokemon => {
            const idMatch = pokemon.id.toString().includes(searchQuery); // IDs que contêm a sequência
            const nameMatch = pokemon.name.toLowerCase().includes(searchQuery); // Nomes que contêm a sequência
            return idMatch || nameMatch;
        });
        displayPokemon(filteredPokemon);
    } else {
        // Se a barra de pesquisa estiver vazia, volta a exibir os Pokémon já carregados
        displayPokemon(displayedPokemon);
    }
}

// Carrega todos os Pokémon para a pesquisa, mas exibe apenas um lote inicial
preloadAllPokemon();
