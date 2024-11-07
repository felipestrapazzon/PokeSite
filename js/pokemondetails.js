// Função para obter o parâmetro 'id' da URL
function getPokemonIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Função para buscar detalhes do Pokémon por ID
async function fetchPokemonDetails(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const pokemon = await response.json();

    // Pega a imagem em alta qualidade (HD)
    const image = pokemon.sprites.other['official-artwork'].front_default;

    // Mapeia os tipos de Pokémon
    const types = pokemon.types.map(typeInfo => typeInfo.type.name);

    // Buscar fraquezas com base nos tipos
    const weaknesses = await fetchWeaknesses(types);

    // Obter descrição do Pokémon
    const description = await fetchPokemonDescription(id);

    return {
        id: pokemon.id,
        name: pokemon.name,
        image: image,
        types: types,
        height: (pokemon.height / 10).toFixed(1), // Altura do Pokémon em metros
        weight: (pokemon.weight / 10).toFixed(1), // Peso do Pokémon em kg
        base_experience: pokemon.base_experience, // Experiência base
        previousId: pokemon.id > 1 ? pokemon.id - 1 : 1010, // ID 1010 é o último Pokémon
        nextId: pokemon.id < 1010 ? pokemon.id + 1 : 1, // ID 1 é o primeiro Pokémon
        ability: pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', '),
        weaknesses: weaknesses, // Adicionando fraquezas
        type1: types[0],
        type2: types[1] || null,
        description: description // Adicionando descrição
    };
}

// Função para buscar a descrição do Pokémon
async function fetchPokemonDescription(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const speciesData = await response.json();
    // Retorna a primeira descrição encontrada em inglês
    const englishDescription = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    return englishDescription ? englishDescription.flavor_text : "Descrição não disponível.";
}

// Função para buscar o nome do Pokémon por ID
async function fetchPokemonName(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = await response.json();
        return pokemon.name;
    } catch (error) {
        return "Desconhecido";
    }
}

// Função para buscar fraquezas com base nos tipos do Pokémon
async function fetchWeaknesses(types) {
    const typeWeaknessPromises = types.map(async (type) => {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await response.json();
        return typeData.damage_relations.double_damage_from.map(weakness => weakness.name);
    });

    const weaknessesArrays = await Promise.all(typeWeaknessPromises);
    // Unir todas as fraquezas em um único array sem repetições
    const weaknesses = [...new Set(weaknessesArrays.flat())];
    return weaknesses;
}

// Função para renderizar detalhes do Pokémon
async function renderPokemonDetails(pokemon) {
    const pokemonContainer = document.querySelector('#pokemon-details');

    // Buscar os nomes do Pokémon anterior e próximo
    const previousPokemonName = await fetchPokemonName(pokemon.previousId);
    const nextPokemonName = await fetchPokemonName(pokemon.nextId);

    // Renderizar o nome e número do Pokémon
    const headerHTML = 
        `<div class="pokemon-header">
            <div class="pokemon-navigation">
                <a class="pokemon-ancor" href="pokemon.html?id=${pokemon.previousId}">
                    <div class="pokemon-ancor-div"><i class="fa-solid fa-chevron-left"></i> Nº ${pokemon.previousId}  <span class="pokemon-name-nav">${previousPokemonName}</span></div>
                </a>
                <a class="pokemon-ancor" href="pokemon.html?id=${pokemon.nextId}">
                    <div class="pokemon-ancor-div"><span class="pokemon-name-nav">${nextPokemonName}</span> Nº ${pokemon.nextId}  <i class="fa-solid fa-chevron-right"></i></div>
                </a>
            </div>
            <span class="pokemon-name">${pokemon.name} <span class="pokemon-name-nav">Nº ${pokemon.id}</span></span>
        </div>`;

    // Renderizar a imagem e informações do Pokémon juntos
    const imageAndInfoHTML = 
        `<div class="pokemon-img-info">
            <div class="col-6 pokemon-img-dad">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="col-6 pokemon-info">
                <div class="pokemon-description">
                    <h3>Descrição</h3>
                    <p>${pokemon.description}</p>
                </div>
                <div class="pokemon-stats">
                    <div class="pokemon-stats-section">
                        <h3 class="pokemon-tittle-stats">Altura</h3>
                        <p>${pokemon.height} m</p>
                    </div>
                    <div class="pokemon-stats-section">
                        <h3 class="pokemon-tittle-stats">Peso</h3>
                        <p>${pokemon.weight} kg</p>
                    </div>
                    <div class="pokemon-stats-section">
                        <h3 class="pokemon-tittle-stats">Habilidades</h3>
                        <p>${pokemon.ability}</p>
                    </div>
                </div>
                <div class="pokemon-types">
                    <h3>Tipo</h3>
                    <div class="pokemon-types-list">
                        <div class="pokemon-type type-${pokemon.type1}">${pokemon.type1}</div>
                        ${pokemon.type2 ? `<div class="pokemon-type type-${pokemon.type2}">${pokemon.type2}</div>` : ''}
                    </div>
                </div>
                <div class="pokemon-weaknesses">
                    <h3>Fraquezas</h3>
                    <div class="pokemon-weaknesses-list">
                        ${pokemon.weaknesses.slice(0, 4).map(weakness => `<div class="pokemon-weakness">${weakness}</div>`).join('')}
                    </div>
                </div>
            </div>
        </div>`;

    pokemonContainer.innerHTML = headerHTML + imageAndInfoHTML;
}

// Função principal que executa ao carregar a página
async function loadPokemonDetails() {
    const pokemonId = getPokemonIdFromUrl(); // Obtém o ID do Pokémon da URL
    if (pokemonId) {
        const pokemon = await fetchPokemonDetails(pokemonId); // Busca os detalhes do Pokémon
        await renderPokemonDetails(pokemon); // Exibe os detalhes na página
    } else {
        document.getElementById('pokemon-details').innerHTML = '<p>Pokémon não encontrado!</p>';
    }
}

// Chama a função principal ao carregar a página
loadPokemonDetails();
