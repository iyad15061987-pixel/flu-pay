const User = require("../models/User");
const Transaction = require("../models/Transaction");


// =========================
// GET WALLET BALANCE
// =========================

exports.getWallet =
async (req,res)=>{

    try{

        const user =
        await User.findById(
            req.user.id
        )
        .select(
            "email balance verified frozen"
        );


        if(!user){

            return res.status(404).json({
                message:
                "User not found"
            });

        }


        res.json({

            success:true,

            wallet:{
                email:user.email,
                balance:user.balance,
                currency:"USD",
                verified:user.verified,
                frozen:user.frozen
            }

        });


    }catch(err){

        console.log(err);

        res.status(500).json({
            message:
            "Wallet error"
        });

    }

};




// =========================
// TRANSACTION HISTORY
// =========================


exports.getTransactions =
async(req,res)=>{

    try{


        const email =
        req.user.email;


        const transactions =
        await Transaction.find({

            $or:[

                {
                    fromEmail:
                    email
                },

                {
                    toEmail:
                    email
                }

            ]

        })

        .sort({
            createdAt:-1
        })

        .limit(50);



        res.json({

            success:true,

            transactions

        });


    }catch(err){

        console.log(err);


        res.status(500).json({

            message:
            "Transactions error"

        });

    }

};