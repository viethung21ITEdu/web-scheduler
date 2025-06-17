const db = require('../utils/db');

class LocationPreference {
  // Lấy location và preferences của user trong một group
  static async getUserLocationPreferences(userId, groupId) {
    try {
      // Lấy location từ bảng LOCATIONS
      const [locationRows] = await db.query(`
        SELECT address, note, updated_at
        FROM LOCATIONS 
        WHERE user_id = ? AND group_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
      `, [userId, groupId]);
      
      // Lấy preferences từ bảng PREFERENCES
      const [prefRows] = await db.query(`
        SELECT preferences_json, other_preference, updated_at
        FROM PREFERENCES 
        WHERE user_id = ? AND group_id = ?
      `, [userId, groupId]);
      
      const result = {
        location: locationRows.length > 0 ? locationRows[0].address : '',
        preferences: {},
        otherPreference: '',
        updated_at: null
      };
      
      if (prefRows.length > 0) {
        // Handle both string and object cases for preferences_json
        const preferencesData = prefRows[0].preferences_json;
        if (typeof preferencesData === 'string') {
          result.preferences = JSON.parse(preferencesData || '{}');
        } else if (typeof preferencesData === 'object' && preferencesData !== null) {
          result.preferences = preferencesData;
        } else {
          result.preferences = {};
        }
        
        result.otherPreference = prefRows[0].other_preference || '';
        result.updated_at = prefRows[0].updated_at;
      }
      
      if (locationRows.length > 0 && (!result.updated_at || locationRows[0].updated_at > result.updated_at)) {
        result.updated_at = locationRows[0].updated_at;
      }
      
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy location preferences:', error);
      throw error;
    }
  }

  // Lưu hoặc cập nhật location và preferences của user trong group
  static async saveUserLocationPreferences(userId, groupId, data) {
    try {
      const { location, preferences, otherPreference } = data;
      let success = true;
      
      // Lưu location vào bảng LOCATIONS
      if (location && location.trim()) {
        // Kiểm tra location đã tồn tại chưa
        const [existingLocation] = await db.query(`
          SELECT location_id FROM LOCATIONS 
          WHERE user_id = ? AND group_id = ?
        `, [userId, groupId]);
        
        if (existingLocation.length > 0) {
          // Update existing location
          await db.query(`
            UPDATE LOCATIONS 
            SET address = ?, updated_at = NOW()
            WHERE user_id = ? AND group_id = ?
          `, [location, userId, groupId]);
        } else {
          // Insert new location
          await db.query(`
            INSERT INTO LOCATIONS (user_id, group_id, address, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
          `, [userId, groupId, location]);
        }
      }
      
      // Lưu preferences vào bảng PREFERENCES
      const preferencesJson = JSON.stringify(preferences);
      
      // Kiểm tra preferences đã tồn tại chưa
      const [existingPref] = await db.query(`
        SELECT preference_id FROM PREFERENCES 
        WHERE user_id = ? AND group_id = ?
      `, [userId, groupId]);
      
      if (existingPref.length > 0) {
        // Update existing preferences
        await db.query(`
          UPDATE PREFERENCES 
          SET preferences_json = ?, other_preference = ?, updated_at = NOW()
          WHERE user_id = ? AND group_id = ?
        `, [preferencesJson, otherPreference || '', userId, groupId]);
      } else {
        // Insert new preferences
        await db.query(`
          INSERT INTO PREFERENCES (user_id, group_id, preferences_json, other_preference, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [userId, groupId, preferencesJson, otherPreference || '']);
      }
      
      return success;
    } catch (error) {
      console.error('Lỗi khi lưu location preferences:', error);
      throw error;
    }
  }

  // Lấy location và preferences của tất cả thành viên trong group
  static async getGroupLocationPreferences(groupId) {
    try {
      // Lấy danh sách tất cả thành viên trong group
      const [members] = await db.query(`
        SELECT DISTINCT u.user_id, u.username, u.full_name
        FROM USERS u
        JOIN MEMBERSHIPS m ON u.user_id = m.user_id
        WHERE m.group_id = ?
        ORDER BY u.full_name ASC
      `, [groupId]);
      
      const result = [];
      
      // Lấy location và preferences cho mỗi thành viên
      for (const member of members) {
        const userPrefs = await this.getUserLocationPreferences(member.user_id, groupId);
        
        result.push({
          user_id: member.user_id,
          username: member.username,
          full_name: member.full_name,
          location: userPrefs.location,
          preferences: userPrefs.preferences,
          otherPreference: userPrefs.otherPreference,
          updated_at: userPrefs.updated_at
        });
      }
      
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy group location preferences:', error);
      throw error;
    }
  }

  // Xóa location preferences của user trong group
  static async deleteUserLocationPreferences(userId, groupId) {
    try {
      // Xóa từ bảng LOCATIONS
      await db.query(`
        DELETE FROM LOCATIONS 
        WHERE user_id = ? AND group_id = ?
      `, [userId, groupId]);
      
      // Xóa từ bảng PREFERENCES
      const [result] = await db.query(`
        DELETE FROM PREFERENCES 
        WHERE user_id = ? AND group_id = ?
      `, [userId, groupId]);
      
      return true; // Trả về true nếu không có lỗi
    } catch (error) {
      console.error('Lỗi khi xóa location preferences:', error);
      throw error;
    }
  }
}

module.exports = LocationPreference; 