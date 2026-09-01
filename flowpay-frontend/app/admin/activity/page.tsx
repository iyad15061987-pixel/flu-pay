"use client";

import {
  useEffect,
  useState,
} from "react";

import API_URL from "@/lib/api";


export default function ActivityPage(){

  const [activities,setActivities] =
    useState<any[]>([]);

  const loadActivity =
    async()=>{

      try{

        const token =
          localStorage.getItem("token");


        const res =
          await fetch(
            `${API_URL}/admin/activity`,
            {
              headers:{
                Authorization:
                `Bearer ${token}`,
              },
            }
          );


        const data =
          await res.json();


        setActivities(
          Array.isArray(data)
          ? data
          : data.activities || []
        );


      }catch(err){

        console.log(err);

      }

    };


  useEffect(()=>{

    loadActivity();

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
        📋 Admin Activity
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
        activities.map(
          (item:any)=>(

          <div
          key={item._id}
          style={{
            padding:15,
            borderBottom:
            "1px solid #374151"
          }}
          >

            <h3>
              {item.action}
            </h3>


            <p>
              {item.description}
            </p>


            <small>
              {
                new Date(
                  item.createdAt
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