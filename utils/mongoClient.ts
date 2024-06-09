
export function NormalizeUsername(username: string): string{
    if(username){
        return username.toLowerCase().trim();
    }else{
        return "";
    }
}