import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundImage = "url('/background/1574333475_88148_Cover_6June28.jpg')";
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';
        document.body.style.fontFamily = 'Arial, sans-serif';

        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.minHeight = '';
            document.body.style.margin = '';
            document.body.style.fontFamily = '';
            document.body.style.display = '';
            document.body.style.justifyContent = '';
            document.body.style.alignItems = '';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/member/login', {
                email,
                password
            });
            if (response.status === 200) {
                setMessage('เข้าสู่ระบบสำเร็จ');
                localStorage.setItem('token', response.data.token);
                setTimeout(() => navigate('/'), 1000);
            }
        } catch (error) {
            setMessage(error.response?.data?.msg || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }} // เริ่มจากด้านขวา
            animate={{ x: 0 }} // เลื่อนเข้ามาที่ตำแหน่งปกติ
            exit={{ x: '-100%' }} // เลื่อนออกไปทางซ้าย
            transition={{ duration: 0.5 }} // ความเร็วของแอนิเมชัน
            className="containerA"
        >
            <h1>ฟาร์มกุ้งก้ามกราม</h1>
            <h2>เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>รหัสผ่าน:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">เข้าสู่ระบบ</button>
            </form>
            <p style={{ color: message.includes('สำเร็จ') ? 'green' : 'red' }}>{message}</p>
            <p>ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a></p>
        </motion.div>
    );
};

export default Login;