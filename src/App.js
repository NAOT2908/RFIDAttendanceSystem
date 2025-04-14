import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RFIDAttendanceSystem() {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' hoặc 'manage'
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [cardInput, setCardInput] = useState('');
  
  // State cho popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('add'); // 'add', 'edit', 'delete'
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    cardUid: '',
    name: '',
    serialNo: '',
    email: '',
    department: 'ĐTVT',
    gender: 'Nam',
    date: new Date().toISOString().split('T')[0]
  });

 
  useEffect(() => {
    const savedUsers = localStorage.getItem('rfid_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const initialUsers = [
        { id: 1, cardUid: '12715493', name: 'Trần Văn A', gender: 'Nam', serialNo: 6, date: '2021-06-22', department: 'ĐTVT 20A', selected: false },
        { id: 2, cardUid: '12715501', name: 'Nguyễn Văn E', gender: 'Nam', serialNo: 5, date: '2021-06-22', department: 'ĐTVT', selected: false },
        { id: 3, cardUid: '8198525', name: 'Nguyễn Văn D', gender: 'Nam', serialNo: 4, date: '2021-06-22', department: 'ĐTVT', selected: false },
        { id: 4, cardUid: '12715413', name: 'Nguyễn Văn C', gender: 'Nam', serialNo: 3, date: '2021-06-22', department: 'ĐTVT', selected: false },
        { id: 5, cardUid: '4448724', name: 'Nguyễn Văn B', gender: 'Nam', serialNo: 2, date: '2021-06-21', department: 'ĐTVT', selected: false },
        { id: 6, cardUid: '911277', name: 'Nguyễn Văn A', gender: 'Nam', serialNo: 1, date: '2021-06-21', department: 'ĐTVT', selected: false }
      ];
      setUsers(initialUsers);
      localStorage.setItem('rfid_users', JSON.stringify(initialUsers));
    }
    
    const savedHistory = localStorage.getItem('rfid_attendance_history');
    if (savedHistory) {
      setAttendanceHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('rfid_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (attendanceHistory.length > 0) {
      localStorage.setItem('rfid_attendance_history', JSON.stringify(attendanceHistory));
    }
  }, [attendanceHistory]);

  const handleSelectUser = (userId) => {
    if (userId === false) {
      setUsers(users.map(user => ({ ...user, selected: false })));
      setSelectedUser(null);
      return;
    }
    setUsers(users.map(user => ({
      ...user,
      selected: user.cardUid === userId
    })));
    
    const selected = users.find(user => user.cardUid === userId);
    setSelectedUser(selected);
  };

  const openPopup = (mode, userId = null) => {
    setPopupMode(mode);
    
    if (mode === 'add') {
      // Reset form for adding new user
      setFormData({
        id: Math.max(...users.map(u => u.id), 0) + 1,
        cardUid: Math.floor(Math.random() * 10000000).toString(),
        name: '',
        serialNo: users.length + 1,
        email: '',
        department: 'ĐTVT',
        gender: 'Nam',
        date: new Date().toISOString().split('T')[0]
      });
    } else if (mode === 'edit' && userId) {
      // Find user and populate form for editing
      const userToEdit = users.find(user => user.cardUid === userId);
      if (userToEdit) {
        setFormData({
          ...userToEdit,
          email: userToEdit.email || ''
        });
      }
    } else if (mode === 'delete' && userId) {
      // Set the user to be deleted
      const userToDelete = users.find(user => user.cardUid === userId);
      if (userToDelete) {
        setFormData(userToDelete);
      }
    }
    
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCardInputChange = (e) => {
    setCardInput(e.target.value);
  };

  const handleUserAction = (e) => {
    e.preventDefault();
    
    if (popupMode === 'add') {
      // Add new user
      const newUser = {
        ...formData,
        selected: false
      };
      
      setUsers([newUser, ...users]);
      
      toast.success('Đã thêm người dùng mới thành công', {
        position: "top-right",
        autoClose: 3000
      });
    } 
    else if (popupMode === 'edit') {
      // Update existing user
      setUsers(users.map(user => 
        user.id === formData.id ? { ...formData, selected: user.selected } : user
      ));
      
      toast.success('Đã cập nhật thông tin người dùng thành công', {
        position: "top-right",
        autoClose: 3000
      });
    } 
    else if (popupMode === 'delete') {
      // Delete user
      setUsers(users.filter(user => user.id !== formData.id));
      setSelectedUser(null);
      
      toast.success('Đã xóa người dùng thành công', {
        position: "top-right",
        autoClose: 3000
      });
    }
    
    // Close popup
    closePopup();
  };

  const handleAttendance = (e) => {
    e.preventDefault();
    
    if (!cardInput.trim()) {
      toast.error('Vui lòng nhập mã thẻ!', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }
    
    // Tìm người dùng có thẻ trùng khớp
    const user = users.find(user => user.cardUid === cardInput);
    
    if (user) {
      // Đã tìm thấy người dùng
      const timestamp = new Date();
      const attendanceRecord = {
        cardUid: user.cardUid,
        name: user.name,
        department: user.department,
        time: timestamp.toLocaleTimeString(),
        date: timestamp.toLocaleDateString()
      };
      
      // Thêm vào lịch sử điểm danh
      const updatedHistory = [attendanceRecord, ...attendanceHistory];
      setAttendanceHistory(updatedHistory);
      
      // Lưu lịch sử điểm danh vào localStorage
      localStorage.setItem('rfid_attendance_history', JSON.stringify(updatedHistory));
      
      // Hiển thị thông báo thành công
      toast.success(`Điểm danh thành công: ${user.name} (${user.department})`, {
        position: "top-right",
        autoClose: 3000
      });
    } else {
      // Không tìm thấy người dùng
      toast.error('Không tìm thấy thông tin người dùng! Vui lòng đăng ký thẻ.', {
        position: "top-right",
        autoClose: 3000
      });
    }
    
    // Reset input
    setCardInput('');
  };

  // Function to clear all attendance history
  const clearAttendanceHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử điểm danh?')) {
      setAttendanceHistory([]);
      localStorage.removeItem('rfid_attendance_history');
      toast.info('Đã xóa toàn bộ lịch sử điểm danh', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-teal-700">
      {/* Navigation */}
      <nav className="bg-teal-700 text-white p-2 border-b border-teal-500">
        <ul className="flex space-x-8 px-4">
          <li 
            className={`cursor-pointer ${activeTab === 'attendance' ? 'font-bold text-white' : 'text-teal-200 hover:text-white'}`}
            onClick={() => setActiveTab('attendance')}
          >
            Điểm Danh
          </li>
          <li 
            className={`cursor-pointer ${activeTab === 'manage' ? 'font-bold text-white' : 'text-teal-200 hover:text-white'}`}
            onClick={() => setActiveTab('manage')}
          >
            Quản Lý Người Dùng
          </li>
          <li className="hover:text-teal-200 cursor-pointer">Users Log</li>
          <li className="hover:text-teal-200 cursor-pointer">Devices</li>
          <li className="hover:text-teal-200 cursor-pointer">admin</li>
          <li className="hover:text-teal-200 cursor-pointer">Log Out</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-teal-600 p-6">
        {/* GIAO DIỆN ĐIỂM DANH */}
        {activeTab === 'attendance' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl text-center text-gray-700 mb-6">ĐIỂM DANH BẰNG THẺ RFID</h2>
            
            {/* Form điểm danh */}
            <div className="max-w-xl mx-auto w-full">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleAttendance} className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label className="text-gray-700 text-lg font-medium mb-2">Mã Thẻ RFID:</label>
                    <input 
                      type="text" 
                      className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Nhập mã thẻ RFID..."
                      value={cardInput}
                      onChange={handleCardInputChange}
                      autoFocus
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-teal-500 text-white py-3 px-4 rounded-lg hover:bg-teal-600 transition font-medium"
                  >
                    Điểm Danh
                  </button>
                </form>
              </div>
            </div>
            
            {/* Lịch sử điểm danh */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl text-center text-gray-700">LỊCH SỬ ĐIỂM DANH GẦN ĐÂY</h3>
                {attendanceHistory.length > 0 && (
                  <button 
                    onClick={clearAttendanceHistory}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition"
                  >
                    Xóa lịch sử
                  </button>
                )}
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-4 text-left">MÃ THẺ</th>
                      <th className="p-4 text-left">TÊN</th>
                      <th className="p-4 text-left">PHÒNG BAN</th>
                      <th className="p-4 text-left">THỜI GIAN</th>
                      <th className="p-4 text-left">NGÀY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.length > 0 ? attendanceHistory.map((record, index) => (
                      <tr 
                        key={index}
                        className={index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'}
                      >
                        <td className="p-4 border-b border-blue-200">{record.cardUid}</td>
                        <td className="p-4 border-b border-blue-200">{record.name}</td>
                        <td className="p-4 border-b border-blue-200">{record.department}</td>
                        <td className="p-4 border-b border-blue-200">{record.time}</td>
                        <td className="p-4 border-b border-blue-200">{record.date}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-500">
                          Chưa có dữ liệu điểm danh
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* GIAO DIỆN QUẢN LÝ */}
        {activeTab === 'manage' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl text-center text-gray-700 mb-6">QUẢN LÝ NGƯỜI DÙNG RFID</h2>
            
            {/* Action Buttons */}
            <div className="flex justify-between mb-2" onClick={() => handleSelectUser(false)}>
              <div>
                {selectedUser && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openPopup('edit', selectedUser.cardUid)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition"
                    >
                      Sửa người dùng
                    </button>
                    <button 
                      onClick={() => openPopup('delete', selectedUser.cardUid)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
                    >
                      Xóa người dùng
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => openPopup('add')}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
              >
                Thêm người dùng mới
              </button>
            </div>
            
            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="p-4 text-left">STT</th>
                    <th className="p-4 text-left">MÃ THẺ</th>
                    <th className="p-4 text-left">TÊN</th>
                    <th className="p-4 text-left">GIỚI TÍNH</th>
                    <th className="p-4 text-left">NGÀY</th>
                    <th className="p-4 text-left">PHÒNG BAN</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.cardUid}
                      className={`${index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'} hover:bg-blue-200 cursor-pointer ${user.selected ? 'bg-blue-300' : ''}`}
                      onClick={() => handleSelectUser(user.cardUid)}
                    >
                      <td className="p-4 border-b border-blue-200">{user.serialNo}</td>
                      <td className="p-4 border-b border-blue-200">
                        <div className="flex items-center">
                          {user.selected && <span className="text-teal-600 mr-2">✓</span>}
                          {user.cardUid}
                        </div>
                      </td>
                      <td className="p-4 border-b border-blue-200">{user.name}</td>
                      <td className="p-4 border-b border-blue-200">{user.gender}</td>
                      <td className="p-4 border-b border-blue-200">{user.date}</td>
                      <td className="p-4 border-b border-blue-200">{user.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
            {popupMode === 'add' && <h3 className="text-xl font-medium mb-4">Thêm Người Dùng Mới</h3>}
            {popupMode === 'edit' && <h3 className="text-xl font-medium mb-4">Sửa Thông Tin Người Dùng</h3>}
            {popupMode === 'delete' && <h3 className="text-xl font-medium mb-4 text-red-600">Xác Nhận Xóa Người Dùng</h3>}
            
            {popupMode === 'delete' ? (
              <div>
                <p className="mb-4">Bạn có chắc chắn muốn xóa người dùng này không?</p>
                <p><strong>ID:</strong> {formData.id}</p>
                <p><strong>Tên:</strong> {formData.name}</p>
                <p><strong>Mã thẻ:</strong> {formData.cardUid}</p>
                <p><strong>Phòng ban:</strong> {formData.department}</p>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={closePopup}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleUserAction}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUserAction}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(popupMode === 'edit') && (
                    <div>
                      <label className="block text-gray-700 mb-2">ID:</label>
                      <input 
                        type="text" 
                        value={formData.id}
                        className="w-full p-3 bg-gray-100 border rounded"
                        disabled
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Mã thẻ:</label>
                    <input 
                      type="text" 
                      name="cardUid"
                      value={formData.cardUid}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Tên người dùng:</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 border rounded"
                      placeholder="Nhập tên..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Số sê-ri:</label>
                    <input 
                      type="number" 
                      name="serialNo"
                      value={formData.serialNo}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 border rounded"
                      placeholder="Nhập số sê-ri..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Email:</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 border rounded"
                      placeholder="Nhập email..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Phòng ban:</label>
                    <select 
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 border rounded"
                    >
                      <option value="ĐTVT">ĐTVT</option>
                      <option value="ĐTVT 20A">ĐTVT 20A</option>
                      <option value="CNTT">CNTT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Giới tính:</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Nam"
                          checked={formData.gender === 'Nam'}
                          onChange={() => setFormData({...formData, gender: 'Nam'})}
                          className="mr-2" 
                        />
                        Nam
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="gender" 
                          value="Nữ"
                          checked={formData.gender === 'Nữ'}
                          onChange={() => setFormData({...formData, gender: 'Nữ'})}
                          className="mr-2" 
                        />
                        Nữ
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={closePopup}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className={`px-4 py-2 ${popupMode === 'add' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded transition`}
                  >
                    {popupMode === 'add' ? 'Thêm người dùng' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}