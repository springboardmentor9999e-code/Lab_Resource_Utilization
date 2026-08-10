import React,{useEffect,useState} from "react";
import axios from "axios";


function EquipmentAvailability(){


    const [equipment,setEquipment]=useState([]);



    useEffect(()=>{


        axios.get("http://localhost:8080/api/equipment")

            .then(response=>{

                console.log(response.data);

                setEquipment(response.data);

            })

            .catch(error=>{

                console.log(error);

            });


    },[]);



    return(

        <div>


            <h2>
                Equipment Availability
            </h2>


            <table border="1" cellPadding="10">


                <thead>

                <tr>

                    <th>
                        Equipment Name
                    </th>

                    <th>
                        Category
                    </th>

                    <th>
                        Quantity
                    </th>

                    <th>
                        Available
                    </th>

                    <th>
                        Status
                    </th>



                </tr>

                </thead>



                <tbody>


                {
                    equipment.map((item)=>(


                        <tr key={item.id}>


                            <td>
                                {item.equipmentName}
                            </td>


                            <td>
                                {item.category}
                            </td>


                            <td>
                                {item.quantity}
                            </td>


                            <td>
                                {item.availableQuantity}
                            </td>


                            <td>

                                {

                                    item.availableQuantity > 0 ?

                                        "Available"

                                        :

                                        "Out of Stock"

                                }


                            </td>


                            <td>


                                {

                                    item.availableQuantity > 0 ?

                                        <button>
                                            Book
                                        </button>

                                        :

                                        <button disabled>
                                            Unavailable
                                        </button>

                                }


                            </td>


                        </tr>


                    ))

                }



                </tbody>


            </table>


        </div>

    );


}


export default EquipmentAvailability;