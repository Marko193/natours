const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//ЗАМЫКАНИЯ - внутренняя f() получит доступ к переменной внешней f()
exports.deleteOne = Model => catchAsync(async(req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, req.body);

    if (!doc) {
        return next(new AppError('No document found with such ID!', 404))
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});