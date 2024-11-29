const { Schema, default: mongoose } = require("mongoose");
const schema = require("./ali_schema")
// const userSchema = require("SherySchema") //SHERY'S SCHEMA 


//JUST ADD THIS ASS A MIDDLEWARE 
const GEH = (err,req,res,next) =>{
    err.status = err.status || 'fail';
    err.statusCode = err.statusCode || 404;
    if(err.name === "ReferenceError"){
        console.log(err)
        console.log('Uncaught Error due to variable!');
        console.log("Server is shutting down.....")
        process.exit(1);
    }else{
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
}
///


const CatchAsync = fn =>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }
}

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.message = message;
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    }
}

// Add Request and save in the database, then send res to frontend as JSON
// ROUTE /addReq 
// Add Key:Value -->> req.logger.user_id:342431 (While Login verification)
exports.addRequest = CatchAsync(async(req,res,next)=>{
    if(!mongoose.isObjectIdOrHexString(req.logger.user_id)) return next(new AppError("something went wrong",500))

    let Request = await schema.create({
        ///NEED USER ID IN REQ.LOGGER BODY TAG
        user_id: req.logger.user_id,
        blood_type: req.body.type,
        units_needed: req.body.units,
        /// FROM FRONTEND IF NO VALUE IS GIVEN BY USER AUTOMATICALLY ITS LOGIN LOCATION WILL BE SENT OR SET
        location: req.body.location
    })

    if(!Request) return next(new AppError("something went wrong,please try again!",404))
    res.status(200).json({
        status:'success',
        Request
    })
})

// Fetch request detail on the basis of the id given in param of request
// ROUTE /request?id=4324
exports.reqDetail = CatchAsync(async(req,res,next)=>{
    if(!mongoose.isObjectIdOrHexString(req.query.id)) return next(new AppError("something went wrong",404))

    const Det = await schema.findById(req.query.id)
    if(!Det) return next(new AppError("content not found",404))
    /// USER DETAILS FOR FETCHING NUMBER FOR WHATSAPP
    ///SHERY SCHEMA MUST HAVE "phone"
    const userDet = await userSchema.findById(Det.user_id).select("phone")
    if(!userDet) return next(new AppError("User details not found",404))
    const whatsappLink = `https://api.whatsapp.com/send?phone=${userDet.phone}`
    res.status(200).json({
        status:"success",
        Request_Detail:Det,
        whatsappLink
    })
})

// Fetch Request on the basis of location. 
// ROUTE  /request/:lahori
exports.fetchReq = CatchAsync(async(req,res,next)=>{
    //GET REQ IN USER LOGIN LOCATION OR GET IN WHICH HE ASKED
    let loc = req.params.location || null

    ///NEED USER ID ADDED IN REQ.BODY in login verification
    if(!loc){
        loc = await schema.findById(req.logger.id).select("location")
        if (!loc) return next(new AppError("User location not found.", 404));
    }

    if(!loc) return next(new AppError("something went wrong",404))
    const Requests = await Schema.find({location: loc})
    if (!Requests || Requests.length === 0) return next(new AppError("No requests found for the specified location.", 404));

    res.status(200).json({
        status:"success",
        Requests
    })
})