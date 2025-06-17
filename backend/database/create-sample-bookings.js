const mysql = require('mysql2/promise');

async function createSampleBookings() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Nguyen21viet8hung5@$',
    database: 'web_scheduler'
  });

  try {
    console.log('Tạo dữ liệu booking mẫu...');

    // 1. Tạo group mẫu (nếu chưa có)
    const [groups] = await connection.query('SELECT * FROM `GROUPS` LIMIT 1');
    let groupId;
    
    if (groups.length === 0) {
      const [groupResult] = await connection.query(`
        INSERT INTO \`GROUPS\` (name, description, leader_id, created_at) 
        VALUES ('Nhóm sinh viên UIT', 'Nhóm học tập và giải trí', 21, NOW())
      `);
      groupId = groupResult.insertId;
      console.log('✅ Đã tạo group mẫu:', groupId);
    } else {
      groupId = groups[0].group_id;
      console.log('✅ Sử dụng group có sẵn:', groupId);
    }

    // 2. Tạo events mẫu
    const events = [
      {
        name: 'Họp nhóm tuần 1',
        start_time: '2025-01-20 14:00:00',
        end_time: '2025-01-20 16:00:00',
        venue: 'Quán Cafe UIT'
      },
      {
        name: 'Workshop lập trình',
        start_time: '2025-01-25 09:00:00', 
        end_time: '2025-01-25 12:00:00',
        venue: 'Nhà hàng Demo'
      },
      {
        name: 'Thảo luận đồ án',
        start_time: '2025-01-28 15:30:00',
        end_time: '2025-01-28 17:30:00', 
        venue: 'Quán Cafe UIT'
      }
    ];

    const eventIds = [];
    for (const event of events) {
      const [result] = await connection.query(`
        INSERT INTO EVENTS (group_id, name, start_time, end_time, venue, status) 
        VALUES (?, ?, ?, ?, ?, 'planned')
      `, [groupId, event.name, event.start_time, event.end_time, event.venue]);
      eventIds.push(result.insertId);
    }
    console.log('✅ Đã tạo', eventIds.length, 'events mẫu');

    // 3. Lấy enterprise_id từ user enterprise1
    const [enterprises] = await connection.query(`
      SELECT enterprise_id FROM ENTERPRISES WHERE user_id = 21 LIMIT 1
    `);
    
    if (enterprises.length === 0) {
      throw new Error('Không tìm thấy enterprise cho user enterprise1');
    }
    const enterpriseId = enterprises[0].enterprise_id;

    // 4. Tạo bookings mẫu
    const bookings = [
      {
        event_id: eventIds[0],
        enterprise_id: enterpriseId,
        booker_id: 21, // Leader ID (enterprise1)
        number_of_people: 8,
        booking_time: '2025-01-20 14:00:00',
        notes: 'Cần bàn lớn cho 8 người, có projector',
        status: 'pending'
      },
      {
        event_id: eventIds[1], 
        enterprise_id: enterpriseId,
        booker_id: 21,
        number_of_people: 15,
        booking_time: '2025-01-25 09:00:00',
        notes: 'Workshop cần không gian rộng, có wifi tốt',
        status: 'confirmed'
      },
      {
        event_id: eventIds[2],
        enterprise_id: enterpriseId, 
        booker_id: 21,
        number_of_people: 5,
        booking_time: '2025-01-28 15:30:00',
        notes: 'Họp nhỏ, cần yên tĩnh',
        status: 'cancelled'
      }
    ];

    for (const booking of bookings) {
      await connection.query(`
        INSERT INTO BOOKINGS (event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        booking.event_id,
        booking.enterprise_id, 
        booking.booker_id,
        booking.number_of_people,
        booking.booking_time,
        booking.notes,
        booking.status
      ]);
    }

    console.log('✅ Đã tạo', bookings.length, 'bookings mẫu');

    // 5. Hiển thị kết quả
    const [results] = await connection.query(`
      SELECT 
        b.booking_id,
        e.name as event_name,
        u.username as booker_name,
        b.booking_time,
        b.number_of_people,
        b.status,
        b.notes
      FROM BOOKINGS b
      JOIN EVENTS e ON b.event_id = e.event_id  
      JOIN USERS u ON b.booker_id = u.user_id
      WHERE b.enterprise_id = ?
      ORDER BY b.booking_time DESC
    `, [enterpriseId]);

    console.log('\n📊 Danh sách bookings đã tạo:');
    results.forEach(booking => {
      console.log(`  - ${booking.event_name} (${booking.booker_name}) - ${booking.status}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

createSampleBookings(); 