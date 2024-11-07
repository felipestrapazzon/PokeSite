// Carregando decks dos jogadores
let player1Deck = JSON.parse(localStorage.getItem('player1Deck'));
let player2Deck = JSON.parse(localStorage.getItem('player2Deck'));

let currentPlayerPokemonIndex = 0;  // Índice do Pokémon atual do Player 1
let currentBotPokemonIndex = 0;     // Índice do Pokémon atual do Player 2
let playerPokemon, botPokemon;
let isPlayer1Turn = true;  // Controla o turno (Player 1 começa)

const playerSprite = document.getElementById('player-sprite');
const botSprite = document.getElementById('bot-sprite');
const playerHealthBar = document.getElementById('player-health');
const botHealthBar = document.getElementById('bot-health');
const movesContainer = document.getElementById('moves');
const movesContainerBot = document.getElementById('moves-bot');
const battleContainer = document.getElementById('battle-container');

// Função para carregar os dados do Pokémon da API
async function fetchPokemonData(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    return response.json();
}

// Função para configurar o Pokémon do Player 1
async function setupPlayerPokemon() {
    playerPokemon = await fetchPokemonData(player1Deck[currentPlayerPokemonIndex].id);
    playerSprite.src = playerPokemon.sprites.versions['generation-v']['black-white'].animated.back_default;
    playerHealthBar.style.width = '100%';
    await setupMoves(playerPokemon.moves);
}

// Função para configurar o Pokémon do Player 2
async function setupBotPokemon() {
    botPokemon = await fetchPokemonData(player2Deck[currentBotPokemonIndex].id);
    botSprite.src = botPokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
    botHealthBar.style.width = '100%';
    await setupMovesBot(botPokemon.moves);
}

// Função para pegar valores aleatórios para os moves
function getRandomSliceIndices(maxLength) {
    const startIndex = Math.floor(Math.random() * (maxLength - 4)); // Garante que há espaço para +4
    const endIndex = startIndex + 4; // O segundo índice é sempre +4 do primeiro
    return [startIndex, endIndex];
}

// Função para configurar os movimentos do Player 1
async function setupMoves(moves) {
    movesContainer.innerHTML = '';
    const maxLength = moves.length;
    const [start, end] = getRandomSliceIndices(maxLength);
    const selectedMoves = moves.slice(start, end);

    selectedMoves.forEach(move => {
        const moveButton = document.createElement('button');
        moveButton.textContent = move.move.name;
        moveButton.onclick = () => {
            if (isPlayer1Turn) {
                attack(move.move.url);
            }
        };
        movesContainer.appendChild(moveButton);
    });
}

// Função para configurar os movimentos do Player 2
async function setupMovesBot(moves) {
    movesContainerBot.innerHTML = '';
    const maxLength = moves.length;
    const [start, end] = getRandomSliceIndices(maxLength);
    const selectedMoves = moves.slice(start, end);

    selectedMoves.forEach(move => {
        const moveButton = document.createElement('button');
        moveButton.textContent = move.move.name;
        moveButton.onclick = () => {
            if (!isPlayer1Turn) {
                botAttack(move.move.url);
            }
        };
        movesContainerBot.appendChild(moveButton);
    });
}

// Função para remover uma Pokébola com animação
function removePokeball(player, index) {
    const pokeball = document.getElementById(`pokeball${index + 1}-${player}`);
    if (pokeball) {
        pokeball.classList.add('fade-out');
        setTimeout(() => {
            pokeball.style.display = 'none'; // Remove a Pokébola após a animação
        }, 500); // O tempo deve corresponder ao da animação
    }
}

// Função de ataque do Player 1
async function attack(moveUrl) {
    const moveData = await fetch(moveUrl).then(response => response.json());
    const damage = Math.floor(Math.random() * (moveData.power || 50)); // Define um valor padrão para o poder do ataque
    let botHealth = parseFloat(botHealthBar.style.width);
    botHealth -= damage;

    if (botHealth <= 0) {
        botHealth = 0;
        removePokeball('player2', currentBotPokemonIndex); // Remover a Pokébola do Player 2
        currentBotPokemonIndex++;
        if (currentBotPokemonIndex < player2Deck.length) {
            alert('Pokémon do Player 2 foi derrotado! Próximo Pokémon...');
            setupBotPokemon(); // Próximo Pokémon do Player 2
        } else {
            displayWinner('Player 1');
            return;
        }
    }

    botHealthBar.style.width = `${botHealth}%`;
    endTurn(); // Passa o turno para o Player 2
}

// Função de ataque do Player 2
async function botAttack(moveUrl) {
    const moveData = await fetch(moveUrl).then(response => response.json());
    const damage = Math.floor(Math.random() * (moveData.power || 50)); // Define um valor padrão para o poder do ataque
    let playerHealth = parseFloat(playerHealthBar.style.width);
    playerHealth -= damage;

    if (playerHealth <= 0) {
        playerHealth = 0;
        removePokeball('player1', currentPlayerPokemonIndex); // Remover a Pokébola do Player 1
        currentPlayerPokemonIndex++;
        if (currentPlayerPokemonIndex < player1Deck.length) {
            alert('Pokémon do Player 1 foi derrotado! Próximo Pokémon...');
            setupPlayerPokemon(); // Próximo Pokémon do Player 1
        } else {
            displayWinner('Player 2');
            return;
        }
    }

    playerHealthBar.style.width = `${playerHealth}%`;
    endTurn(); // Passa o turno de volta para o Player 1
}

// Função para alternar o turno e ocultar os botões do jogador fora do turno
function endTurn() {
    isPlayer1Turn = !isPlayer1Turn;
    movesContainer.style.display = isPlayer1Turn ? 'block' : 'none';
    movesContainerBot.style.display = isPlayer1Turn ? 'none' : 'block';
}

// Função para exibir o vencedor e remover o conteúdo da batalha
// Função para exibir o vencedor
// Função para exibir o vencedor e ocultar o conteúdo da batalha
function displayWinner(winner) {
    const winnerContainer = document.getElementById('winner-container');
    const winnerMessage = document.getElementById('winner-message');
    const backButton = document.getElementById('back-button');
    const battleContainer = document.getElementById('battle-container');
    const tittleGame = document.getElementById('tittle-game');

    // Define a mensagem de vencedor
    winnerMessage.textContent = `O vencedor é o ${winner}!`;

    // Exibe a mensagem de vencedor e o botão
    winnerContainer.style.display = 'block';

    // Oculta o conteúdo da batalha
    battleContainer.style.display = 'none';

    tittleGame.style.display = 'none';



    // Adiciona funcionalidade para redirecionar para "choice-deck.html"
    backButton.onclick = function() {
        window.location.href = 'choice-deck.html';
    };
}



// Inicia a batalha carregando o primeiro Pokémon de ambos os jogadores
setupPlayerPokemon();
setupBotPokemon();
endTurn();
// Esconde os ataques do Player 2 inicialmente