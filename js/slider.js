// Função para pegar Pokémon aleatórios da PokéAPI
async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemon = await response.json();
    return pokemon;
}

// Função para gerar um número aleatório de Pokémon entre 1 e 898 (Pokémon conhecidos até a geração VIII)
function getRandomPokemonId() {
    return Math.floor(Math.random() * 898) + 1; // Gera um ID aleatório entre 1 e 898
}

// Função para carregar o slider com Pokémon aleatórios
async function loadRandomPokemonSlides() {
    const slidesContainer = document.querySelector('.slides');
    slidesContainer.innerHTML = ''; // Limpa os slides existentes

    // Gerar 6 Pokémon aleatórios
    for (let i = 0; i < 6; i++) {
        const randomPokemonId = getRandomPokemonId();
        const pokemon = await fetchPokemon(randomPokemonId);

        // Criando os tipos de Pokémon (Fire, Grass, etc.)
        const types = pokemon.types.map(typeInfo => {
            const typeName = typeInfo.type.name;
            return `<span class="type-${typeName}">${typeName.charAt(0).toUpperCase() + typeName.slice(1)}</span>`;
        }).join('');

        // Criando o slide com link
        const slide = document.createElement('a');
        slide.href = `pokemon.html?id=${pokemon.id}`; // Redireciona para a página de detalhes do Pokémon
        slide.classList.add('slide');
        slide.style.backgroundImage = `url(${pokemon.sprites.other['official-artwork'].front_default})`; // Usar a imagem oficial
        slide.innerHTML = `
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
            <h3><b>Tipo</b><br><br>${types}</h3>
        `;

        // Adicionar o slide ao container
        slidesContainer.appendChild(slide);
    }
}

// Funções para mover o slider
let currentSlide = 0;
const moveSlide = (direction) => {
    const slides = document.querySelector('.slides');
    const totalSlides = document.querySelectorAll('.slide').length;

    currentSlide += direction;

    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }

    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
};

// Carregar os slides com Pokémon aleatórios quando a página carregar
window.onload = () => {
    loadRandomPokemonSlides();
};
