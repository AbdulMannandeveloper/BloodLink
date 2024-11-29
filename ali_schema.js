const { default: mongoose } = require("mongoose")

const schema = new mongo.Schema({
    user_id:{
      type: mongo.Schema.Types.ObjectId,
      ref: userSchema, ///NAME OF USER SCHEMA PREPAID MODEL 
      required: true,
      index: true
    },
    // IN USER SCHEMA USER BLOOD TYPE IS ALREADY STORED BUT THIS IS FOR FLEXIBILITY IF USER WILLING TO INPUT FOR OTHER PERSON
    blood_type:{
        type:String,
        required:true,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    units_needed:{
        type:Number,
        required:true,
        min: 1 
    },
    request_date:{
        type: Date,
        default: Date.now,
    },
    status:{
        type:Boolean,
        default:false
    },
    /// IT IS FOR FLEXIBILITY FOR USER TO GIVE LOCATION OTHER THAN ITS OWN
    location:{
        type:String,
        required: true
    }
})

module.exports = mongoose.model("Request",schema);