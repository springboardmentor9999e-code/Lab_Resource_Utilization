import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Category() {

    const [categoryList, setCategoryList] = useState([]);

    const [category, setCategory] = useState({
        categoryName: ""
    });

    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {

        try {

            const response = await api.get("/category");

            setCategoryList(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleChange = (e) => {

        setCategory({
            ...category,
            [e.target.name]: e.target.value
        });

    };

    const editCategory = (item) => {

        setCategory({
            categoryName: item.categoryName
        });

        setEditingId(item.categoryId);

        setShowForm(true);

    };

    const saveCategory = async () => {

        try {

            if (editingId) {

                await api.put(`/category/${editingId}`, category);

                alert("Category Updated Successfully");

            } else {

                await api.post("/category", category);

                alert("Category Added Successfully");

            }

            setCategory({
                categoryName: ""
            });

            setEditingId(null);

            setShowForm(false);

            fetchCategories();

        } catch (error) {

            console.log(error);

            alert("Unable to Save Category");

        }

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div style={{ flex: 1, padding: "30px" }}>

                <h1>Category Management</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px"
                    }}
                >

                    <h2>Category List</h2>

                    <button
                        onClick={() => {

                            setShowForm(true);

                            setEditingId(null);

                            setCategory({
                                categoryName: ""
                            });

                        }}
                    >
                        + Add Category
                    </button>

                </div>

                {showForm && (

                    <div
                        style={{
                            border: "1px solid gray",
                            padding: "20px",
                            marginBottom: "20px"
                        }}
                    >

                        <input
                            type="text"
                            name="categoryName"
                            placeholder="Category Name"
                            value={category.categoryName}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <button onClick={saveCategory}>
                            {editingId ? "Update" : "Save"}
                        </button>

                    </div>

                )}

                <table border="1" cellPadding="10" width="100%">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Category Name</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {categoryList.map((item) => (

                            <tr key={item.categoryId}>

                                <td>{item.categoryId}</td>

                                <td>{item.categoryName}</td>

                                <td>

                                    <button
                                        onClick={() => editCategory(item)}
                                        style={{
                                            border: "none",
                                            padding: "6px 10px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Category;