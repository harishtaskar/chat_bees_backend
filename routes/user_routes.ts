import {Router} from 'express';

const user_router = Router();

user_router.post("/signup", (req, res)=>{
    try {
        const body = req.body;
        const requiredFields: any = {};
        if(body?.username?.trim() === ""){
            requiredFields.username = "require";
        }else if(!body?.dob){
            requiredFields.dob = "require";
        }else if (!body?.profileicon || body?.profileicon?.trim() === ""){
            requiredFields.profileicon = "require"
        }else if (!body?.gender || (body?.gender?.trim() !== "male" || body?.gender?.trim() !== "female")){
            requiredFields.gender = {require : true, type: "male/female"};
        }else if(!body?.password || body?.password?.trim().length < 8){
            requiredFields.password = {require : true, length: ">=8"};
        }
        if(Object.keys(requiredFields).length !== 0){
            res.status(500).json({require : requiredFields, msg: "invalid payload", res: "Error"})
        }else{
            res.status(200).json({msg: "user in created"});
        }        
    } catch (error) {
        res.status(500).json({error, msg: "Error while creating new user", status: 500, res: "Error"});
    }
})

export default user_router;