var express = require('express');
var router = express.Router();

var controller = require('app/controllers/users');


router.post('/create', controller.createUser);
router.put('/update',controller.updateUser);
router.put('/delete', controller.deleteUser);
router.put('/set_cloud_token', controller.setCloudTokenByUserId);


module.exports = router;
