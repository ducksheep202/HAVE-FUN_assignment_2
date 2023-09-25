/*RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author: Ho Minh Duc, Nguyen Bao Hoang, Muhammad Zainulabideen Noaman, Pham Tuan Vy 
ID: s3994277, s3978685, s4021266, s3989482
Acknowledgement: chatGPT*/
const express = require('express');
const { Vendor, Customer, Shipper, User, Product, Order } = require('./user');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs')
const app = express();
app.use(express.static('public'));
const PORT = 3000;
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://113:113@website.rd8w5ia.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.log(error.message));
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
function checkLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('login'); // Hoặc trả về trang lỗi hoặc thông báo
    }
    next();
}
//register page
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', upload.single('profilePicture'), async (req, res) => {
    try {
        let newUser;
        
        switch (req.body.userType) {
            case 'vendor':
                newUser = new Vendor(req.body);
                break;
            case 'customer':
                newUser = new Customer(req.body);
                break;
            case 'shipper':
                newUser = new Shipper(req.body);
                break;
            default:
                return res.status(400).send('Loại người dùng không hợp lệ.');
        }

        // Xử lý tệp tải lên (hình ảnh đại diện)
        if (req.file) {
            const imageBuffer = req.file.buffer;
            const imageBase64 = imageBuffer.toString('base64');
            newUser.profilePicture = `data:${req.file.mimetype};base64,${imageBase64}`;
        }

        await newUser.save();
        res.render('login');
    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});
//login page
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send('Tên người dùng hoặc mật khẩu không chính xác.');
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).send('Tên người dùng hoặc mật khẩu không chính xác.');
        }

        req.session.userId = user._id;

        switch (user.userType) {
            case 'vendor':
                return res.redirect('/vendorAccount');
            case 'customer':
                return res.redirect('/customerAccount');
            case 'shipper':
                return res.redirect('/shipperAccount');
            default:
                return res.status(400).send('Loại người dùng không xác định.');
        }

    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});
//My account route
app.get('/vendorAccount', checkLoggedIn, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(400).send('Người dùng không tồn tại.');
        }

        res.render('vendorAccount', { user: user });
    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});



app.get('/customerAccount', checkLoggedIn, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(400).send('Người dùng không tồn tại.');
        }

        res.render('customerAccount', { user: user });
    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});


app.get('/shipperAccount', checkLoggedIn, async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(400).send('Người dùng không tồn tại.');
        }

        res.render('shipperAccount', { user: user });
    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});
// Route xử lý thay đổi thông tin cá nhân và hình ảnh đại diện
app.post('/updateProfile', checkLoggedIn, upload.single('newProfilePicture'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(400).send('Người dùng không tồn tại.');
        }

        // Xử lý tệp tải lên (hình ảnh đại diện)
        if (req.file) {
            const imageBuffer = req.file.buffer;
            const imageBase64 = imageBuffer.toString('base64');
            user.profilePicture = `data:${req.file.mimetype};base64,${imageBase64}`;
        }

        // Xử lý thông tin thay đổi tùy thuộc vào loại người dùng
        if (user.userType === 'vendor') {
            if (req.body.newBusinessName) {
                user.businessName = req.body.newBusinessName;
            }
            if (req.body.newBusinessAddress) {
                user.businessAddress = req.body.newBusinessAddress;
            }
        } else if (user.userType === 'customer') {
            if (req.body.newName) {
                user.name = req.body.newName;
            }
            if (req.body.newAddress) {
                user.address = req.body.newAddress;
            }
        } else if (user.userType === 'shipper') {
            if (req.body.newDistributionHub) {
                user.distributionHub = req.body.newDistributionHub;
            }
        }

        await user.save();
        res.redirect(`/${user.userType}Account`);
    } catch (error) {
        res.status(400).send('Có lỗi xảy ra: ' + error.message);
    }
});

// CUSTOMER
app.get('/customer-page', (req, res) => {
    Product.findById()
    .then((products) => {
      res.render("customerpage",
      {
        products: products,
        title: "Customer Page",
        layout: "views/customerpage.ejs"
      })
    })
    .catch((error) => {
      console.log(error.message);
    })
    
  });
  
  app.get("/shopping-cart", (req, res) => {
    res.render("shopping_cart",
        {
            title: "Shopping Cart",
            layout: "views/cutomer_page/customerorder.ejs"
        })
  })
  
  app.post("/order-generate", (req, res) => {
  
    const total_price = req.body.price
        .map(function (elt) { // assure the value can be converted into an integer
            return /^\d+$/.test(elt) ? parseInt(elt) : 0;
        })
        .reduce(function (a, b) { // sum all resulting numbers
            return a + b
        });
  
    const newOrder = new Order({
        customer_name: req.body.name,
        address: req.body.address,
        status: "Active",
        total_price: total_price,
        products_list: req.body.product,
        business_name: req.body.name,
        business_address: req.body.address
    })
  
    newOrder.save()
        .then(() => res.redirect('/customer-page'))
        .catch(error => res.send(error.message));
})

// VENDOR
app.get('/vendor-page', (req, res) => {
    res.render("vendor_page",
      {
        title: "Vendor Page",
        layout: "views/vendor_page/vendorpage.ejs"
      })
  });
  
  app.get('/vendor-page/all-product', (req, res) => {
    Product.find()
    .then((products) => {
      res.render("vendor_all_product",
      {
        products: products,
        title: "Vendor Page",
        layout: "views/vendor_page/viewmyproduct.ejs"
      })
    })
    .catch((error) => {
      console.log(error.message);
    })
  });
  
  app.post("/vendor-page/form-processing", upload.single("image"), (req, res) => {
    console.log(req.file);
    const product = new Product(req.body);
    product.save()
    .then(() => res.redirect('vendor_all_product'))
    .catch((error) => res.send(error));
  });
  
  app.get('/vendor-page/add-product', (req, res) => {
    res.render("vendor_add_product",
      {
        title: "Vendor Page",
        layout: "views/vendor_page/addproduct.ejs"
      })
});
  
  
// SHIPPER
app.get("/shipper-profile", (req, res) => {
    res.render("shipper_profile",
      {
        title: "Shipper Page",
        layout: "views/shipper_page/shipperpage.ejs"
      })
  })
  
  
  app.get('/shipper-page', (req, res) => {
    res.render("shipper_form",
      {
        title: "Shipper Page",
        layout: "views/shipper_page/shipperpage.ejs"
      })
  });
  
  app.post("/shipper-page/:id/update", (req, res) => {
    console.log(req.params.id);
    Order.findByIdAndUpdate(req.params.id, { status: "Delivered" }, {
        new: true,
        runValidators: true,
    })
        .then(order => {
            if (!order) {
                return res.send("Not found any order matching the ID");
            }
            res.redirect("/shipper-page");
        })
        .catch(error => res.send(error));
  })
  
  app.get('/shipper-page/:username/all-product', async (req, res) => {
    Order.find({})
        .then(orders => res.render('shipper_form',
            {
                orders,
                title: "Shipper Page",
                distribution_title: req.params.username + " Distribution Hub", layout: "views/shipper_page/shipperpage.ejs"
            }))
        .catch(error => res.send(error));
  });
  
  app.get('/shipper-page/:_id/details', async (req, res) => {
    Order.findById(req.params._id)
        .then(order => {
            if (!order) {
                return res.send('Not found any product matching the ID!');
            }
            res.render("order_details",
                {
                    order,
                    title: "Order Details",
                    layout: "views/shipper_page/orderdetail.ejs"
                });
        })
        .catch(error => res.send(error));
  })
  
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});