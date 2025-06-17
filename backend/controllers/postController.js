const db = require('../utils/db');

// Lấy tất cả posts đã được approve cho feed
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.post_id as id,
        p.enterprise_id,
        p.title,
        p.content,
        p.created_at,
        p.status,
        e.name as enterprise_name,
        e.enterprise_type as type,
        e.address as enterprise_address
      FROM posts p
      JOIN enterprises e ON p.enterprise_id = e.enterprise_id
      WHERE p.status = 'approved'
    `;
    
    const params = [];
    
    // Filter by enterprise type if provided
    if (type) {
      query += ' AND e.enterprise_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [posts] = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      JOIN enterprises e ON p.enterprise_id = e.enterprise_id
      WHERE p.status = 'approved'
    `;
    
    const countParams = [];
    if (type) {
      countQuery += ' AND e.enterprise_type = ?';
      countParams.push(type);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách posts:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách posts' });
  }
};

// Lấy post theo ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.post_id as id,
        p.enterprise_id,
        p.title,
        p.content,
        p.created_at,
        p.status,
        e.name as enterprise_name,
        e.enterprise_type as type,
        e.address as enterprise_address
      FROM posts p
      JOIN enterprises e ON p.enterprise_id = e.enterprise_id
      WHERE p.post_id = ?
    `;
    
    const [posts] = await db.query(query, [id]);
    
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
    }
    
    res.json(posts[0]);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin post:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin post' });
  }
};

// Toggle like/unlike post (placeholder - cần implement table likes)
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    
    // TODO: Implement likes functionality
    res.json({ message: 'Like functionality chưa được implement' });
  } catch (error) {
    console.error('Lỗi khi toggle like:', error);
    res.status(500).json({ message: 'Lỗi server khi toggle like' });
  }
};

// Lấy posts theo status (cho admin)
exports.getPostsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10, enterprise_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE p.status = ?';
    const params = [status];
    
    if (enterprise_id) {
      whereClause += ' AND p.enterprise_id = ?';
      params.push(enterprise_id);
    }
    
    const query = `
      SELECT 
        p.post_id as id,
        p.enterprise_id,
        p.title,
        p.content,
        p.created_at,
        p.status,
        e.name as enterprise_name,
        e.enterprise_type as type,
        e.address as enterprise_address
      FROM posts p
      JOIN enterprises e ON p.enterprise_id = e.enterprise_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    const [posts] = await db.query(query, params);
    
    res.json(posts);
  } catch (error) {
    console.error('Lỗi khi lấy posts theo status:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy posts theo status' });
  }
};

// Cập nhật status của post (cho admin)
exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status không hợp lệ' });
    }
    
    const query = 'UPDATE posts SET status = ? WHERE post_id = ?';
    const [result] = await db.query(query, [status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
    }
    
    res.json({ message: 'Cập nhật status thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật status post:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật status post' });
  }
}; 