import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Info, Phone, LogOut, Search, Fish, AlertTriangle, Clock, Shrimp } from 'lucide-react'; // ลบ X ออก
import config from './config';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });
    const [waterData, setWaterData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        document.body.style.minHeight = '100vh';
        document.body.style.margin = '0';

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchWaterQuality = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/member/water-quality`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('API Response:', response.data);
                if (response.data && response.data.length > 0) {
                    setWaterData(response.data);
                } else {
                    setError('ไม่มีข้อมูลคุณภาพน้ำในฐานข้อมูล');
                }
            } catch (err) {
                setError('ไม่สามารถดึงข้อมูลคุณภาพน้ำได้: ' + (err.response?.data?.error || err.message));
                console.error('Error fetching water quality:', err);
            }
        };

        fetchWaterQuality();

        return () => {
            document.body.style.minHeight = '';
            document.body.style.margin = '';
        };
    }, [navigate]);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${config.API_BASE_URL}/member/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                alert('การออกจากระบบล้มเหลว');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
            console.error(error);
        }
    };

    const openModal = (title, content) => {
        setModal({ isOpen: true, title, content });
    };

    const closeModal = () => {
        setModal({ isOpen: false, title: '', content: '' });
    };

    const latestData = waterData.length > 0 ? waterData[0] : null;
    console.log('Latest Data:', latestData);

    const chartData = latestData
        ? [
              { name: 'ความเค็ม (ppt)', value: Number(latestData.salinity) || 0 },
              { name: 'pH', value: Number(latestData.ph) || 0 },
              { name: 'ออกซิเจน (mg/L)', value: Number(latestData.dissolved_oxygen) || 0 },
              { name: 'ไนโตรเจน (mg/L)', value: Number(latestData.nitrogen) || 0 },
              { name: 'ไฮโดรเจนซัลไฟด์ (mg/L)', value: Number(latestData.hydrogen_sulfide) || 0 },
              { name: 'BOD (mg/L)', value: Number(latestData.bod) || 0 },
              { name: 'อุณหภูมิ (°C)', value: Number(latestData.temperature) || 0 },
          ]
        : [
              { name: 'ความเค็ม (ppt)', value: 0 },
              { name: 'pH', value: 0 },
              { name: 'ออกซิเจน (mg/L)', value: 0 },
              { name: 'ไนโตรเจน (mg/L)', value: 0 },
              { name: 'ไฮโดรเจนซัลไฟด์ (mg/L)', value: 0 },
              { name: 'BOD (mg/L)', value: 0 },
              { name: 'อุณหภูมิ (°C)', value: 0 },
          ];
    console.log('Chart Data:', chartData);

    const checkAlerts = () => {
        if (!latestData) {
            return 'ไม่มีข้อมูลคุณภาพน้ำให้ตรวจสอบ';
        }

        const alerts = [];

        if (latestData.salinity < 0 || latestData.salinity > 15) {
            alerts.push(`ความเค็ม (${latestData.salinity} ppt) อยู่นอกเกณฑ์ (ควรอยู่ระหว่าง 0-15 ppt)`);
        }

        if (latestData.ph < 7.0 || latestData.ph > 8.5) {
            alerts.push(`pH (${latestData.ph}) อยู่นอกเกณฑ์ (ควรอยู่ระหว่าง 7.0-8.5)`);
        }

        if (latestData.dissolved_oxygen < 5) {
            alerts.push(`ออกซิเจนละลายน้ำ (${latestData.dissolved_oxygen} mg/L) ต่ำเกินไป (ควร ≥ 5 mg/L)`);
        }

        if (latestData.nitrogen > 1) {
            alerts.push(`ไนโตรเจน (${latestData.nitrogen} mg/L) สูงเกินไป (ควร ≤ 1 mg/L)`);
        }

        if (latestData.hydrogen_sulfide > 0.1) {
            alerts.push(`ไฮโดรเจนซัลไฟด์ (${latestData.hydrogen_sulfide} mg/L) สูงเกินไป (ควร ≤ 0.1 mg/L)`);
        }

        if (latestData.bod > 10) {
            alerts.push(`BOD (${latestData.bod} mg/L) สูงเกินไป (ควร ≤ 10 mg/L)`);
        }

        if (latestData.temperature < 26 || latestData.temperature > 32) {
            alerts.push(`อุณหภูมิ (${latestData.temperature}°C) อยู่นอกเกณฑ์ (ควรอยู่ระหว่าง 26-32°C)`);
        }

        if (alerts.length === 0) {
            return 'คุณภาพน้ำอยู่ในเกณฑ์ปกติ';
        }

        return alerts.join('\n');
    };

    const handleAlertClick = () => {
        const alertContent = checkAlerts();
        openModal('⚠️ การแจ้งเตือนคุณภาพน้ำ', alertContent);
    };

    const fetchLoginLogs = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
            openModal('📜 ประวัติการใช้งาน', 'ไม่พบ token กรุณาล็อกอินใหม่');
            return;
        }

        try {
            const response = await axios.get(`${config.API_BASE_URL}/member/login-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Login Logs Response:', response.data);
            if (response.data && response.data.length > 0) {
                const tableContent = `
                    <table class="login-logs-table">
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>อีเมล</th>
                                <th>เวลาที่ล็อกอิน</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data
                                .map(
                                    (log, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${log.email}</td>
                                            <td>${new Date(log.login_time).toLocaleString('th-TH')}</td>
                                            <td class="${log.status === 'online' ? 'status-online' : 'status-offline'}">${log.status}</td>
                                        </tr>
                                    `
                                )
                                .join('')}
                        </tbody>
                    </table>
                `;
                openModal('📜 ประวัติการใช้งาน', tableContent);
            } else {
                openModal('📜 ประวัติการใช้งาน', 'ไม่มีข้อมูลประวัติการล็อกอิน');
            }
        } catch (err) {
            console.error('Error fetching login logs:', err);
            let errorMessage = 'ไม่สามารถดึงข้อมูลประวัติการล็อกอินได้';
            if (err.response) {
                errorMessage += `: ${err.response.status} - ${err.response.data?.error || err.message}`;
            } else if (err.request) {
                errorMessage += ': ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
            } else {
                errorMessage += `: ${err.message}`;
            }
            openModal('📜 ประวัติการใช้งาน', errorMessage);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            className="home-page"
        >
            <header className="header">
                <nav className="nav">
                    <a href="/water-quality">
                        <BarChart size={18} /> ข้อมูลคุณภาพน้ำ
                    </a>
                    <a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault();
                            openModal(
                                'ℹ️ เกี่ยวกับเรา',
                                'ฟาร์มกุ้งก้ามกรามคุณภาพสูง ก่อตั้งปี 2545 ด้วยประสบการณ์กว่า 20 ปี ในการผลิตและพัฒนากุ้งก้ามกรามที่มีคุณภาพสูง ทั้งในด้านการเพาะพันธุ์ การดูแล และการเก็บเกี่ยว เรามุ่งเน้นการใช้เทคโนโลยีและวิธีการที่ทันสมัยเพื่อให้ได้ผลผลิตที่ดีที่สุด สำหรับลูกค้าของเรา พร้อมทั้งสร้างความยั่งยืนในธุรกิจและการดูแลสิ่งแวดล้อม ด้วยการใช้ระบบจัดการคุณภาพน้ำที่ได้มาตรฐาน เพื่อให้มั่นใจในความปลอดภัยและคุณภาพของกุ้งที่เราให้บริการ'
                            );
                        }}
                    >
                        <Info size={18} /> เกี่ยวกับเรา
                    </a>
                    <a
                        href="/shrimp-info"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/shrimp-info');
                        }}
                    >
                        <Shrimp size={18} /> เกี่ยวกับกุ้ง
                    </a>
                    <a
                        href="#contact"
                        onClick={(e) => {
                            e.preventDefault();
                            openModal(
                                '📞 ติดต่อเรา',
                                'คุณสามารถติดต่อเราได้ที่:\n📧 farm@example.com\n📱 123-456-7890'
                            );
                        }}
                    >
                        <Phone size={18} /> ติดต่อเรา
                    </a>
                    <button
                        className="alert-btn"
                        onClick={handleAlertClick}
                    >
                        <AlertTriangle size={18} /> การแจ้งเตือน
                    </button>
                    <button
                        className="history-btn"
                        onClick={fetchLoginLogs}
                    >
                        <Clock size={18} /> ดูประวัติการใช้งาน
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> ออกจากระบบ
                    </button>
                </nav>
            </header>

            <div className="main-content">
                <div className="content-left"></div>
                <div className="content-right">
                    <h1><Fish size={32} /> ยินดีต้อนรับสู่ฟาร์มกุ้งก้ามกราม</h1>
                    <h2>เพื่อคุณภาพน้ำที่ดี</h2>
                    <p>
                        จัดการฟาร์มของคุณด้วยข้อมูลคุณภาพน้ำแบบเรียลไทม์ <br />
                        ติดตามระดับ pH, ออกซิเจนละลายน้ำ, แอมโมเนีย และไนไตรต์ <br />
                        เพื่อให้มั่นใจว่าสภาพแวดล้อมของกุ้งเหมาะสมที่สุดสำหรับการเจริญเติบโต
                    </p>

                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                    <div style={{ width: '100%', maxWidth: 400, height: 350, marginBottom: 20 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={130}
                                    fill="#8884d8"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="button-group">
                        <button
                            className="action-btn"
                            onClick={() => navigate('/water-quality')}
                            style={{ marginTop: '10px' }}
                        >
                            <Search size={18} /> ดูข้อมูลคุณภาพน้ำ
                        </button>
                    </div>
                </div>
            </div>

            {modal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{modal.title}</h2>
                        <div
                            className="modal-content"
                            dangerouslySetInnerHTML={{ __html: modal.content }}
                        />
                        <button className="close-btn" onClick={closeModal}>
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Home;