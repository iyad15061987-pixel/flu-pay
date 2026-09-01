"use client";

import {
useEffect,
useState
} from "react";

import API_URL from "@/lib/api";


export default function TransactionsPage(){

const [transactions,setTransactions]=
useState<any[]>([]);


const loadTransactions =
async()=>{

try{

const token =
localStorage.getItem("token");


const res =
await fetch(
`${API_URL}/admin/transactions`,
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);


const data =
await res.json();


setTransactions(
Array.isArray(data)
? data
: data.transactions || []
);


}catch(err){

console.log(err);

}

};



useEffect(()=>{

loadTransactions();

},[]);



return(

<div
style={{
padding:40,
background:"#0f172a",
minHeight:"100vh",
color:"white"
}}
>


<h1>
💳 Transactions
</h1>


<br/>


<div
style={{
background:"#111827",
padding:25,
borderRadius:20
}}
>


{
transactions.map(
(tx:any)=>(


<div
key={tx._id}
style={{
padding:15,
borderBottom:
"1px solid #374151"
}}
>


<p>
<strong>
ID:
</strong>{" "}
{tx._id}
</p>


<p>
Amount:
$
{tx.amount}
</p>


<p>
Status:
{tx.status}
</p>


<p>
Fee:
$
{tx.fee}
</p>


<small>
{
new Date(
tx.createdAt
)
.toLocaleString()
}
</small>


</div>


)

)
}


</div>


</div>


);

}