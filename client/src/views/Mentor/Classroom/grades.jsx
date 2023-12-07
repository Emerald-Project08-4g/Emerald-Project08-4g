//This file is for demonstration as to how a google classroom implementation would work
//Actual implementation is not possible due to not actually having a classroom to connect to
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const gradeBook = () => {
  const [studentGrades, setStudentGrades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientId = 'id';
        const accessToken = 'access token';
        const headers = { Authorization: 'Bearer ${accessToken}' };
        const url = "API URL goes here";
         //URL would also require what classroom and assignment is being updated

        const response = await axios.get(url, { headers });

        const studentSubmissions = response.data.studentSubmissions;
        const grades = studentSubmissions.map(submission => ({
          studentId: submission.userId,
          grade: submission.assignedGrade || 'Not Graded',
        }));

        setStudentGrades(grades);

      } 
      catch (error) {
        console.error('Error: ', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Grade Book</h1>
      <ul>
        {studentGrades.map((student, index) => (
          <li key={index}>
            Student ID: {student.studentId}, Grade: {student.grade}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default gradeBook;
