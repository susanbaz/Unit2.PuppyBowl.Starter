// document.addEventListener('DOMContentLoaded', () => {

const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2302-ACC-PT-WEB-PT-C';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;
// const PLAYERS_URL = `${APIURL}/players`;


/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(`${APIURL}/players`);
        const players = await response.json();
        return players;

    } catch (err) {
        console.error('Uh oh, trouble fetching players!', err);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/players/${playerId}`);
        const player = await response.json();
        return player;
   } catch (err) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, err);
    }
};

const addNewPlayer = async (playerObj) => {
    // console.log(playerObj)
    try {
        const response = await fetch(`${APIURL}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerObj),
        });
        const newPlayer = await response.json();
        // console.log(response);
        
        if (!newPlayer.success) {
            console.log(newPlayer.error);
            throw new Error('Failed to add player!');
        }
        
        return newPlayer;
    } catch (err) {
        console.error('Oops, something went wrong with adding that player!', err);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}/players/${playerId}`, {
            method: 'DELETE',
        });
        const removedPlayer = await response.json();
        return removedPlayer;
    } catch (err) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            err
        );
    }
};

// 
//  * It takes an array of player objects, loops through them, and creates a string of HTML for each
class Player {
    constructor(playerObj) {
        this.playerId = playerObj.playerId;
        this.playerName = playerObj.playerName;
        this.playerBreed = playerObj.playerBreed;
        this.playerStatus = playerObj.playerStatus;
        this.imageUrl = playerObj.imageUrl;
        this.createAt = playerObj.createAt;
        this.updateAt = playerObj.updateAt;
        this.teamId = playerObj.teamId;
        this.cohortId = playerObj.cohortId;
           }

render() {
    return `
        <div class="player-card">
            <h3>${this.playerName}</h3>
            <p>${this.playerBreed}</p>
            <img src="${this.imageUrl}" alt="${this.playerName}">
            <button class="details-btn" data-player-id="${this.playerId}">See details</button>
            <button class="remove-btn" data-player-id="${this.playerId}">Remove from roster</button>
        </div>
    `;
}
}


//  * player, then adds that string to a larger string of HTML that represents all the players. 
Array.prototype.render = function () {
    return this.map((player) => player.render()).join('');
  };
  

  

//  * Then it takes that larger string of HTML and adds it to the DOM. 
 
const renderAllPlayers = (playerList) => {
    let playerContainerHTML = '';
    const maxPlayersPerPage = 24;
    let playerCount = 0;

    playerList.data.players.forEach((player) => {
        const playerHTML = `
            <div class="player-card">
                <h3>${player.name}</h3>
                <p>${player.breed}</p>
                <img src="${player.imageUrl}" alt="${player.playerName}">
                <button class="details-btn" data-player-id="${player.playerId}">See details</button>
                <button class="remove-btn" data-player-id="${player.playerId}">Remove from roster</button>
            </div>
        `;

        playerContainerHTML += playerHTML;

        playerCount++;
        if (playerCount >= maxPlayersPerPage) {
            playerContainer.innerHTML = playerContainerHTML;
            return; 
        }
    });

    playerContainer.innerHTML = playerContainerHTML;
};

//add event listeners to the buttons
try {
    const detailsButtons = document.querySelectorAll('.details-btn');
    detailsButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
            const playerId = event.target.dataset.playerId;
            const player = await fetchSinglePlayer(playerId);
            
            console.log(player);
        });
    });

    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
            const playerId = event.target.dataset.playerId;
            await removePlayer(playerId);
            // Re-render the players after removal
            const updatedPlayers = await fetchAllPlayers();
            renderAllPlayers(updatedPlayers);
        });
    });
} catch (err) {
    console.error('Uh oh, trouble rendering players!', err);
}

//  * 
//  * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
//  * API to get the details for a single player. 
//  * 
//  * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
//  * the API to remove a player from the roster. 
//  * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
//  * @param playerList - an array of player objects
//  * @returns the playerContainerHTML variable.
//  * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
//  * and re-renders the list of players.
//  * fetches all players from the database, and renders them to the DOM.
//  */
const renderNewPlayerForm = () => {
    try {
        const formHTML = `
        <form id="new-player-form">
            <label for="playerName">Player Name</label>
            <input type="text" id="playerName">
            <label for="playerBreed">Player Breed</label>
            <input type="text" id="playerBreed">
            <label for="playerStatus">Player Status</label>
            <label for="playerStatusField">Field</label>                       
            <input type="radio" id="playerStatusField" name="playerStatus" value="field">
            <label for="playerStatusBench">Bench</label> 
            <input type="radio" id="playerStatusBench" name="playerStatus" value="bench">
                <br>
        <label for="imageUrl">Image URL</label>
        <input type="url" id="imageUrl">
        <label for="teamId">Team ID</label>
        <input type="number" id="teamId">
        <button type="submit">Add Player</button>
        <button type="button">Delete</button>
    </form>
        `;
        newPlayerFormContainer.innerHTML = formHTML;

        const addPlayerForm = document.getElementById('new-player-form');
        addPlayerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

    // const idInput = document.getElementById('playerId');
    const nameInput = document.getElementById('playerName');
    const breedInput = document.getElementById('playerBreed');
    const statusInputField = document.getElementById('playerStatusField');
    const statusInputBench = document.getElementById('playerStatusBench');
    const teamIdInput = document.getElementById('teamId');
    const imageUrlInput = document.getElementById('imageUrl');

    const newPlayer = {
        
        name: nameInput.value,
        breed: breedInput.value,
        status: statusInputField.checked ? 'field' : 'bench',
        teamId: teamIdInput.value,
        imageUrl: imageUrlInput.value,
    };

    await addNewPlayer(newPlayer);
    nameInput.value = '';
    breedInput.value = '';
    statusInputField.checked = false;
    statusInputBench.checked = false;
    teamIdInput.value = '';
    imageUrlInput.value = '';

            // await addNewPlayer(newPlayer);
            // addPlayerForm.reset();
            
            const updatedPlayers = await fetchAllPlayers();
            renderAllPlayers(updatedPlayers);
        });
    } catch (err) {
        console.error('Uh oh, trouble rendering the new player form!', err);
    }
};

const init = async () => {
    const players = await fetchAllPlayers();
    renderAllPlayers(players);

    renderNewPlayerForm();
}

init();
// renderNewPlayerForm();

// export { renderAllPlayers, renderNewPlayerForm };


