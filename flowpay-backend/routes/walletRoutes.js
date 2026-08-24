const express =
require("express");


const router =
express.Router();


const {
auth
}
=
require("../middleware/auth");


const {

getWallet,
getTransactions

}
=
require("../controllers/walletController");



// WALLET

router.get(

"/wallet",

auth,

getWallet

);



// HISTORY

router.get(

"/transactions",

auth,

getTransactions

);



module.exports =
router;