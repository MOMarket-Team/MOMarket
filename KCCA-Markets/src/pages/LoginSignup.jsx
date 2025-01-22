import React, {useState} from 'react'
import './CSS/LoginSignup.css'

const LoginSignup = () => {

  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({
    username : "",
    password : "",
    email : ""
  })

  const changeHandler = (e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  const login = async () =>{
  
    let responseData;
    await fetch('https://momarket-7ata.onrender.com/login',{
      method:'POST',
      headers:{
        Accept:'application/form-data',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response)=> response.json())
      .then((data)=>responseData=data)

    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/"); //maybe here we shall link the to check
    }
    else{
      alert(responseData.errors)
    }

  }
  //below are logics func for signup to db
  const signup = async () =>{
    let responseData;
    await fetch('https://momarket-7ata.onrender.com/signup',{
      method:'POST',
      headers:{
        Accept:'application/form-data',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response)=> response.json())
      .then((data)=>responseData=data)

    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/"); //maybe here we shall link the to check
    }
    else{
      alert(responseData.errors)
    }
  }

  return (
    <div className='loginsignup'>
      <div className="container">
        <h1>{state}</h1>
        <div className="fields">
          {state==="Sign Up"?<input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder='Enter Your Name' />:<></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email Address' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
        </div>
        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>
        {state==="Sign Up"?<p className="login">Already have an account? <span onClick={()=>{setState("Login")}}>Login here</span></p>:
        <p className="login">Create an account? <span onClick={()=>{setState("Sign Up")}}>Click here</span></p>}
        <div className="agree">
          <input type="checkbox" name='' id=''/>
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup