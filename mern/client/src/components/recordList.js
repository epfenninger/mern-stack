import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
const bcrypt = require("bcryptjs");

const jsonRecords = [{ name: "", email: "", password: "" }];

const Record = (props) => (
  <tr>
    <td>{props.record.name}</td>
    <td>{props.record.email}</td>
    <td style={{ webkitTextSecurity: "disc" }}>password</td>
    <td>
      <Link className="btn btn-link" to={`/edit/${props.record._id}`}>
        Edit
      </Link>{" "}
      |
      <button
        className="btn btn-link"
        onClick={() => {
          props.deleteRecord(props.record._id);
        }}
      >
        Delete
      </button>
    </td>
  </tr>
);

async function submitRecord(record) {
  // When a post request is sent to the create url, we'll add a new record to the database.
  record.password = bcrypt.hashSync(record.password, 12);
  console.log(record);
  await fetch("http://localhost:5000/record/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  }).catch((error) => {
    window.alert(error);
    return;
  });
}

function parseFile(files) {
  if (files) {
    Papa.parse(files[0], {
      complete: function (results) {
        results.data.splice(1).map(function (item) {
          let newRecord = {
            name: item[0],
            email: item[1],
            password: item[2],
          };
          submitRecord(newRecord);
        });
      },
    });
  }
}

export default function RecordList() {
  const [records, setRecords] = useState([]);

  // This method fetches the records from the database.
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5000/record/`);

      if (!response.ok) {
        const message = `An error occured: ${response.statusText}`;
        window.alert(message);
        return;
      }

      const records = await response.json();
      setRecords(records);
    }

    getRecords();

    return;
  }, [records.length]);

  // This method will delete a record
  async function deleteRecord(id) {
    await fetch(`http://localhost:5000/${id}`, {
      method: "DELETE",
    });

    const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords);
  }

  // This method will map out the records on the table
  function recordList() {
    return records.map((record) => {
      return (
        <Record
          record={record}
          deleteRecord={() => deleteRecord(record._id)}
          key={record._id}
        />
      );
    });
  }

  // This following section will display the table with the records of individuals.
  return (
    <div>
      <h3>Record List</h3>
      <table className="table table-striped" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{recordList()}</tbody>
      </table>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(e) => {
          const files = e.target.files;
          parseFile(files);
        }}
      />
    </div>
  );
}
