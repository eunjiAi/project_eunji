import React, { useState } from 'react';
import './Signup.css'; // 위에서 작성한 Signup.css 파일
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }
    // 회원가입 처리 로직 (ex. API 호출)
    console.log('회원가입 정보', { email, password, name, birthdate, gender, phone, agreeTerms });
    navigate('/dashboard'); // 회원가입 후 리다이렉트
  };

  return (
    <div className="signup-container">
      <section className="signup-box">
        <h1 className="signup-title">회원가입</h1>
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="name">이름</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="birthdate">생년월일</label>
            <input 
              type="date" 
              id="birthdate" 
              value={birthdate} 
              onChange={(e) => setBirthdate(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>성별</label>
            <div className="gender-options">
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Male" 
                  onChange={(e) => setGender(e.target.value)} 
                  required 
                />
                <span className="radio-mark"></span> 남성
              </label>
              <label className="custom-radio">
                <input 
                  type="radio" 
                  name="gender" 
                  value="Female" 
                  onChange={(e) => setGender(e.target.value)} 
                  required 
                />
                <span className="radio-mark"></span> 여성
              </label>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="phone">휴대폰 번호</label>
            <input 
              type="tel" 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group checkbox-group">

            <div className="terms-text">

              <p>
                본 서비스는 사용자 정보를 보호하며, 수집된 데이터는 사용자에게 맞춤형 서비스를 제공하기 위한 목적으로만 사용됩니다.
              </p>
              <p>
                더 자세한 내용은 <a href="/terms" target="_blank">이용약관</a>을 참조하십시오.

                <input 
                  type="checkbox" 
                  checked={agreeTerms} 
                  onChange={() => setAgreeTerms(!agreeTerms)} 
                  required 
                />
                <span className="checkbox-mark"></span> 
              </p>
              
            </div>
          </div>
          <button type="submit" className="signup-button">회원가입</button>
        </form>
      </section>
    </div>
  );
}

export default Signup;
