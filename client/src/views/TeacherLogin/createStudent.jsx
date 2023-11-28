// Import necessary libraries
import axios from 'axios';
import { message } from 'antd';



// Your component definition
export default function CreateStudentHandler() {


  const handleCreateStudent = () => {
 
    const studentData = {
      name: 'John Doe', // Example name
      character: 'Student Character', // Example character
      classroom: 'Classroom ID', // Example classroom ID
    };

  
    axios.post('http://your-strapi-server-url/api/students', studentData)
      .then(response => {
       
        console.log('Student created:', response.data);
      
      })
      .catch(error => {
      
        console.error('Error creating student:', error);
        message.error('Failed to create student. Please try again.');
      });
  };


}
