"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";


export default function TreasuryPage() {

  const [data,setData] =
    useState<any>(null);


  const loadTreasury = async()=>{

    try{

      const token =
        localStorage.getItem("token");


      const res =
        await fetch(
          `${API_URL}/treasury/overview`,
          {
            headers:{
              Authorization:
              `Bearer ${token}`,
            },
          }
        );


      const json =
        await res.json();


      setData(json);


    }catch(err){

      console.log(err);

    }

  };


  useEffect(()=>{

    loadTreasury();

  },[]);



  if(!data){

    return (

      <div
      style={{
        background:"#0f172a",
        color:"white",
        minHeight:"100vh",
        padding:40,
      }}
      >

        Loading Treasury...

      </div>

    );

  }



  return (

    <div

    style={{

      padding:40,

      background:"#0f172a",

      minHeight:"100vh",

      color:"white",

    }}

    >


      <h1>
        🏦 Treasury Management
      </h1>


      <br />



      <div

      style={{

        display:"grid",

        gridTemplateColumns:
        "repeat(auto-fit,minmax(250px,1fr))",

        gap:20,

      }}

      >



        <div
        style={{
          background:"#111827",
          padding:25,
          borderRadius:20,
        }}
        >

          <h2>
            Treasury Balance
          </h2>

          <h1>
            $
            {Number(
              data.treasury?.balance || 0
            ).toFixed(4)}

          </h1>

        </div>





        <div
        style={{
          background:"#111827",
          padding:25,
          borderRadius:20,
        }}
        >

          <h2>
            Revenue
          </h2>

          <h1>
            $
            {Number(
              data.treasury?.revenue || 0
            ).toFixed(4)}

          </h1>

        </div>





        <div
        style={{
          background:"#111827",
          padding:25,
          borderRadius:20,
        }}
        >

          <h2>
            Total Fees
          </h2>

          <h1>
            $
            {Number(
              data.totalFees || 0
            ).toFixed(4)}

          </h1>

        </div>





        <div
        style={{
          background:"#111827",
          padding:25,
          borderRadius:20,
        }}
        >

          <h2>
            Transactions
          </h2>

          <h1>
            {
              data.totalTransactions || 0
            }
          </h1>

        </div>


      </div>





      <br />


      <div

      style={{

        background:"#111827",

        padding:25,

        borderRadius:20,

      }}

      >


        <h2>
          Treasury Account
        </h2>


        <br />


        <p>
          Email:
          {" "}
          {
            data.treasury?.email
          }
        </p>


        <br />


        <p>
          Status:
          {" "}
          {
            data.status
          }
        </p>


        <br />


        <p>
          Total Platform Revenue:
          {" "}
          $
          {
            Number(
              data.totalRevenue || 0
            ).toFixed(4)
          }

        </p>


      </div>





      <br />


      <div

      style={{

        background:"#111827",

        padding:25,

        borderRadius:20,

      }}

      >


        <h2>
          Latest Accounting Activity
        </h2>


        <br />


        <p>
          Treasury is connected with:
        </p>


        <ul>

          <li>
            ✅ Wallet System
          </li>

          <li>
            ✅ Ledger
          </li>

          <li>
            ✅ Accounting Entries
          </li>

          <li>
            ✅ Transfer Fees
          </li>

        </ul>


      </div>



    </div>

  );

}