const express = require('express');
const router = express.Router();
const my_controller = require('../controllers/mycontroller/getuser');
const user_controller = require('../controllers/api/usercontroller');
const interest_controller = require('../controllers/api/interestcontroller');

//search
router.post('/user_search', my_controller.test);

//user
router.post('/add_user', user_controller.add_user);
router.post('/sign_in', user_controller.sign_in);

//interest
router.post('/interest', interest_controller.interest);
router.get('/interestt', interest_controller.interestt);

router.post('/get_user', my_controller.get_all);
router.post('/get_individual_user', my_controller.get_individual_user);
router.post('/page', my_controller.newpage);
module.exports = router;
