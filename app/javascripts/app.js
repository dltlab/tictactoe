import '../stylesheets/app.css'

// Import libraries we need.
import Web3 from 'web3'
import Contract from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import ttt_artifacts from '../../build/contracts/TicTacToe.json'

let TTT = Contract(ttt_artifacts)

let accounts
let account

let addr1 = '0x877d2df64e5ccdde3fc4a2250c30c56148effc89' // Player 1 Address
let addr2 = '0xdf7be7583edfe654886e3e65c9f190ef574cad39' // Player 2 Address
let gas =4500000;
let started = 0

String.prototype.replaceAll = function (find, replace) {
  let str = this
  return str.replace(new RegExp(find, 'g'), replace)
}

function getRowInput() {
  return document.getElementById('row').value;
}

function getColInput() {
  return document.getElementById('column').value;
}

function make_board (row) {
  return String(row).replaceAll('1', '&nbsp;-&nbsp;').replaceAll('2', ' x ').replaceAll('3', ' 0 ')
}

window.App = {
  start: function () {
    let self = this

    // Bootstrap the MetaCoin abstraction for Use.
    TTT.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err !== null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.')
        return
      }

      accounts = accs
      account = accounts[0]

      self.update()

      //document.getElementById('loaded').innerText = 'Loaded.'
      //document.getElementById('accounts').innerText = String(web3.eth.accounts).replace(',', '  ')
    })

  },

  setStatus: function (message) {
    let status = document.getElementById('status')
    status.innerHTML = message
  },

  ///-------------------------------------------------------

  update: async function () {

    console.log("update function");

    let ttt = await TTT.deployed()

    console.log("trying to get_state of "+addr1);
    let state = await ttt.get_state(addr1, {from: addr1})
    console.log(JSON.stringify(state, null, 2))

    document.getElementById('balance').innerText = 'Pot: ' + web3.fromWei(state[0], "ether") + " ETHER";

    console.log("state[3]= "+state[3])
    document.getElementById('turn').innerText = 'Turn: ' + (state[3].toNumber() === 1 ? ' Player 2 ' : 'Player 1')

    //let number = web3.eth.blockNumber;
    //let info = web3.eth.getBlock(number)
    //console.log(JSON.stringify(info, null, 2));
    //document.getElementById('timelimit').innerText = 'Timeleft: ' + (state[2] > 0 ? ((state[2] - info.timestamp) + ' Seconds') : 'Not Started.')

    let board = document.getElementById('board');
    board.innerHTML = make_board(state[4]) + '<br>' + make_board(state[5]) + '<br>' + make_board(state[6]);


    let balance1 = web3.eth.getBalance(addr1);
    let balance2 = web3.eth.getBalance(addr2);

    document.getElementById('balance1').innerText = "balance: " + web3.fromWei(balance1, "ether");
    document.getElementById('balance2').innerText = "balance: " + web3.fromWei(balance2, "ether");
  },

  claim_reward: async function () {
    let ttt = await TTT.deployed()
    await ttt.claim_reward(addr1, {from: addr1, gas: gas})
    this.update()
  },


  start_game: async function () {

    let ttt = await TTT.deployed()

    let res1 = await ttt.start(addr1, {from: addr1, value: web3.toWei(10, "ether"), gas: gas})
    console.log(JSON.stringify(res1))

    let res2 = await ttt.join(addr1, {from: addr2, value: web3.toWei(10, "ether"), gas: gas})
    console.log(JSON.stringify(res2))

    started = 1
    this.update()
  },

  play: async function (player) {

    let ttt = await TTT.deployed()

    let row = getRowInput();
    let col = getColInput();

    let res = await ttt.play(addr1, parseInt(row), parseInt(col), {from: (player === 1 ? addr1 : addr2), gas: gas})
    console.log(JSON.stringify(res, null, 2))

    this.update()
  },

  go_player_1: async function () {
    this.play(1)
  },

  go_player_2: async function () {
    this.play(2)
  },

}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear or you have 0 MetaCoin, ensure you\'ve configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask')
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }

  App.start()
})


