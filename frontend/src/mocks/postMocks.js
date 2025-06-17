// Mock data for posts

// Helper function to format createdAt randomly in past days
const getRandomDate = (days = 30) => {
  const date = new Date();
  const randomDays = Math.floor(Math.random() * days);
  date.setDate(date.getDate() - randomDays);
  return date;
};

// Mock posts data - chỉ hiển thị bài đăng từ doanh nghiệp để quảng cáo
const mockPosts = [
  {
    id: '1',
    title: 'Cafe HoiAn',
    content: 'Ghé thăm Cafe HoiAn - nơi hòa quyện giữa hương vị cà phê truyền thống và không gian cổ kính đặc trưng của phố Hội. Địa chỉ: 15 Nguyễn Thái Học, Hội An. Giảm 10% cho khách đặt bàn trước!',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '1',
      name: 'Cafe HoiAn',
      avatar: ''
    },
    createdAt: getRandomDate(2),
    address: '15 Nguyễn Thái Học, Hội An',
    type: 'Quán Cafe',
    website: 'https://cafehoian.vn',
    phone: '0236 123 4567'
  },
  {
    id: '2',
    title: 'Nhà Hàng Biển Đông',
    content: 'Nhà hàng hải sản tươi ngon bậc nhất Đà Nẵng. Đặc sản: Cua rang me, Tôm hùm nướng phô mai, Lẩu hải sản. Không gian rộng rãi, view biển tuyệt đẹp. Đặt bàn ngay hôm nay để được giảm 15%!',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '2',
      name: 'Nhà Hàng Biển Đông',
      avatar: ''
    },
    createdAt: getRandomDate(5),
    address: '255 Võ Nguyên Giáp, Đà Nẵng',
    type: 'Nhà hàng',
    website: 'https://nhahangbiendong.vn',
    phone: '0236 389 7654'
  },
  {
    id: '3',
    title: 'TTTM Vincom Plaza',
    content: 'Khuyến mãi lớn nhất năm! Sale off đến 50% tại các gian hàng thời trang, mỹ phẩm, đồ điện tử. Đặc biệt: Tặng voucher 500k cho hóa đơn từ 3 triệu. Thời gian: 15/05 - 30/05/2025.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '3',
      name: 'Vincom Plaza',
      avatar: ''
    },
    createdAt: getRandomDate(1),
    address: '54 Nguyễn Chí Thanh, Đà Nẵng',
    type: 'Trung tâm thương mại',
    website: 'https://vincom.com.vn/vi/tttm/vincom-plaza-ngo-quyen-da-nang',
    phone: '0236 555 7890'
  },
  {
    id: '4',
    title: 'Phở Hà Nội',
    content: 'Phở Hà Nội - Hương vị truyền thống giữa lòng Đà Nẵng. Nước dùng ngọt thanh từ xương bò hầm 24 giờ, bánh phở dai mềm, thịt bò tươi thái mỏng. Địa chỉ: 123 Lê Duẩn, Đà Nẵng.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '4',
      name: 'Phở Hà Nội',
      avatar: ''
    },
    createdAt: getRandomDate(3),
    address: '123 Lê Duẩn, Đà Nẵng',
    type: 'Quán ăn',
    website: 'https://phohanoi.com',
    phone: '0236 333 2211'
  },
  {
    id: '5',
    title: 'AEON Mall',
    content: 'AEON Mall - Điểm đến mua sắm và giải trí hàng đầu. Khai trương chuỗi cửa hàng thời trang cao cấp với nhiều ưu đãi hấp dẫn. Tầng 4 vừa ra mắt khu vui chơi trẻ em hiện đại nhất miền Trung.',
    image: 'https://images.unsplash.com/photo-1519567241046-7262e6f6f383?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '5',
      name: 'AEON Mall',
      avatar: ''
    },
    createdAt: getRandomDate(6),
    address: '1 Đường 2/9, Đà Nẵng',
    type: 'Trung tâm thương mại',
    website: 'https://aeonmall-vietnam.com',
    phone: '0236 626 2727'
  },
  {
    id: '6',
    title: 'Highland Coffee',
    content: 'Highland Coffee khai trương chi nhánh mới tại Lotte Mart Đà Nẵng. Không gian thoáng đãng, view toàn cảnh thành phố. Ưu đãi đặc biệt: Mua 1 tặng 1 cho tất cả đồ uống trong tuần đầu khai trương.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '6',
      name: 'Highland Coffee',
      avatar: ''
    },
    createdAt: getRandomDate(4),
    address: 'Tầng 5, Lotte Mart, Đà Nẵng',
    type: 'Quán Cafe',
    website: 'https://www.highlandscoffee.com.vn',
    phone: '0236 789 1234'
  },
  {
    id: '7',
    title: 'Spa Relax',
    content: 'Spa Relax - Thiên đường nghỉ dưỡng và làm đẹp. Dịch vụ: Massage body, Facial treatment, Nail care. Khuyến mãi tháng 5: Giảm 30% cho khách hàng mới, tặng thêm 1 liệu trình chăm sóc da mặt.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '7',
      name: 'Spa Relax',
      avatar: ''
    },
    createdAt: getRandomDate(7),
    address: '88 Bạch Đằng, Đà Nẵng',
    type: 'Spa & Làm đẹp',
    website: 'https://sparelax.vn',
    phone: '0236 999 8877'
  },
  {
    id: '8',
    title: 'Nhà sách Phương Nam',
    content: 'Nhà sách Phương Nam - Không gian văn hóa dành cho mọi độ tuổi. Sự kiện: Ra mắt sách mới với tác giả Nguyễn Nhật Ánh, 15/05/2025. Ưu đãi: Giảm 20% cho tất cả sách mới, tặng bookmark đặc biệt.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '8',
      name: 'Nhà sách Phương Nam',
      avatar: ''
    },
    createdAt: getRandomDate(2),
    address: '45 Nguyễn Văn Linh, Đà Nẵng',
    type: 'Nhà sách',
    website: 'https://nhasachphuongnam.com',
    phone: '0236 345 6789'
  },
  {
    id: '9',
    title: 'Rạp chiếu phim CGV',
    content: 'CGV ra mắt công nghệ chiếu phim ScreenX 270 độ đầu tiên tại Đà Nẵng. Đặc biệt: Combo bắp nước giảm 25% cho mọi suất chiếu vào thứ 4 hàng tuần. Đặt vé online được giảm thêm 10%.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '9',
      name: 'CGV Cinemas',
      avatar: ''
    },
    createdAt: getRandomDate(3),
    address: 'Vincom Plaza, Đà Nẵng',
    type: 'Giải trí',
    website: 'https://www.cgv.vn',
    phone: '1900 6017'
  },
  {
    id: '10',
    title: 'Nhà hàng Viet Kitchen',
    content: 'Viet Kitchen - Nơi hội tụ tinh hoa ẩm thực Việt ba miền. Buffet trưa chỉ 299k/người, tối 399k/người với hơn 100 món ăn đặc sắc. Không gian sang trọng phù hợp cho tiệc gia đình, hội họp.',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MTR9&auto=format&fit=crop&w=800&q=80',
    author: {
      id: '10',
      name: 'Viet Kitchen',
      avatar: ''
    },
    createdAt: getRandomDate(5),
    address: '25 Trần Phú, Đà Nẵng',
    type: 'Nhà hàng',
    website: 'https://vietkitchen.vn',
    phone: '0236 777 8899'
  }
];

// Function to simulate fetching posts from an API
export const getPosts = () => {
  return new Promise((resolve) => {
    // Simulate network request delay
    setTimeout(() => {
      resolve(mockPosts);
    }, 800);
  });
};

// Function to get a post by ID
export const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.id === id);
      if (post) {
        resolve(post);
      } else {
        reject(new Error('Post not found'));
      }
    }, 300);
  });
};

// Function to get paginated posts with filters
export const getPaginatedPosts = (page = 1, limit = 5, filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredPosts = [...mockPosts];
      
      // Apply type filter if provided
      if (filters.type) {
        filteredPosts = filteredPosts.filter(post => post.type === filters.type);
      }
      
      // Apply search filter if provided
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(search) || 
          post.content.toLowerCase().includes(search) ||
          post.author.name.toLowerCase().includes(search)
        );
      }
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      // Return posts with pagination info
      resolve({
        posts: paginatedPosts,
        totalPosts: filteredPosts.length,
        currentPage: page,
        totalPages: Math.ceil(filteredPosts.length / limit),
        hasMore: endIndex < filteredPosts.length
      });
    }, 800);
  });
};

export default mockPosts;
