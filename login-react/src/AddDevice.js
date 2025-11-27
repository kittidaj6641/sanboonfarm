import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive } from 'lucide-react';
import axios from 'axios';
import config from './config';
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // ล้าง error เมื่อผู้ใช้พิมพ์
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลก่อนส่ง
    if (!formData.deviceName.trim() || !formData.deviceId.trim()) {
      setError('กรุณากรอกชื่อและรหัสอุปกรณ์');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Session หมดอายุ กรุณาล็อกอินใหม่');
      navigate('/login');
      return;
    }

    try {
      console.log('Sending data:', formData);
      console.log('API URL:', `${config.API_BASE_URL}/member/devices/add`);
      
      // ยิง API ไปที่ /member/devices/add
      const response = await axios.post(
        `${config.API_BASE_URL}/member/devices/add`, 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Response:', response);

      if (response.status === 201) {
        alert('✅ เพิ่มอุปกรณ์สำเร็จ!');
        // ล้างฟอร์ม
        setFormData({
          deviceName: '',
          deviceId: '',
          location: ''
        });
        // รอ 1 วินาทีแล้วค่อยกลับหน้าหลัก
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error("Error adding device:", error);
      console.error("Error response:", error.response);
      
      let errorMsg = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      
      if (error.response) {
        // เซิร์ฟเวอร์ตอบกลับมาพร้อม error
        errorMsg = error.response.data?.error || error.response.data?.msg || errorMsg;
        
        if (error.response.status === 401) {
          errorMsg = 'Session หมดอายุ กรุณาล็อกอินใหม่';
          setTimeout(() => navigate('/login'), 2000);
        }
      } else if (error.request) {
        // ส่ง request ไปแล้วแต่ไม่ได้รับ response
        errorMsg = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้";
      }
      
      setError(errorMsg);
      alert(`❌ เกิดข้อผิดพลาด: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="add-device-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <div className="form-card">
        <div className="form-header">
          <div className="icon-bg">
            <HardDrive size={32} color="#007bff" />
          </div>
          <h1>ลงทะเบียนอุปกรณ์</h1>
          <p>เพิ่มอุปกรณ์ใหม่ลงในระบบฐานข้อมูล</p>
        </div>

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่ออุปกรณ์ (Device Name) *</label>
            <input 
              type="text" 
              name="deviceName" 
              placeholder="เช่น บ่อกุ้งโซน A" 
              value={formData.deviceName}
              onChange={handleChange}
              disabled={loading}
              required 
            />
          </div>

          <div className="form-group">
            <label>รหัสอุปกรณ์ (Device ID) *</label>
            <div className="input-with-hint">
              <input 
                type="text" 
                name="deviceId" 
                placeholder="เช่น ESP32_001" 
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
                required 
              />
              <small className="hint">* ห้ามซ้ำกับที่มีอยู่ในระบบ</small>
            </div>
          </div>

          <div className="form-group">
            <label>สถานที่ติดตั้ง</label>
            <input 
              type="text" 
              name="location" 
              placeholder="ระบุพิกัด หรือ ชื่อฟาร์ม" 
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'กำลังบันทึก...' : (
              <>
                <Save size={18} /> บันทึกข้อมูล
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default AddDevice;
