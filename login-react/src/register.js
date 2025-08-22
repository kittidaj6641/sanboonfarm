import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from './config';
import './register.css';

const Register = () => {
    const [name, setName] = useState('');
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
        setMessage('');

        try {
            const response = await axios.post(`${config.API_BASE_URL}/register/register`, {
                name,
                email,
                password
            });

            if (response.status === 201) {
                setMessage('สมัครสมาชิกสำเร็จ');
                setTimeout(() => navigate('/login'), 1000);
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const errorMsg = error.response.data?.msg || 'เกิดข้อผิดพลาดในการสมัคร';

                if (status === 409) {
                    setMessage('อีเมล์นี้ถูกใช้ไปแล้ว');
                } else if (status === 400) {
                    setMessage(errorMsg); // แสดงข้อความจากเซิร์ฟเวอร์ เช่น "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
                } else {
                    setMessage(errorMsg);
                }
            } else if (error.request) {
                setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ');
            } else {
                setMessage('เกิดข้อผิดพลาดในการสมัคร: ' + error.message);
            }
            console.error('Error during registration:', error);
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            className="containers"
        >
            <h1>ฟาร์มกุ้งก้ามกราม</h1>
            <h2>สมัครสมาชิก</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>ชื่อ:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>รหัสผ่าน:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">สมัครสมาชิก</button>
            </form>
            <p style={{ color: message.includes('สำเร็จ') ? 'green' : 'red' }}>{message}</p>
            <p>มีบัญชีแล้ว? <a href="/login">เข้าสู่ระบบ</a></p>
        </motion.div>
    );
};

export default Register;