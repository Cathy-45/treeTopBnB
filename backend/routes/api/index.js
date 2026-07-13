const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const spotsRouter = require('./spots.js')
const deleteImagesRouter = require('./delete-images.js')
const reviewsRouter = require('./review.js')
const bookingsRouter = require('./booking.js')
const experiencesRouter = require('./experiences.js')
const paymentsRouter = require('./payments.js')
const { restoreUser } = require("../../utils/auth.js");

router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter)

router.use('/', deleteImagesRouter)

router.use('/reviews', reviewsRouter)

router.use('/bookings', bookingsRouter)

router.use('/experiences', experiencesRouter)

router.use('/payments', paymentsRouter)

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;
