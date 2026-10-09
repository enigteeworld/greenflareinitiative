'use client';
import {useEffect,useState,useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {supabase} from '@/lib/supabaseClient';
export type Profile={id:string;username:string|null;full_name:string|null;campus:string|null;hostel:string|null;onboarding_completed:boolean|null;avatar_url:string|null};
export function useStudent(needsOnboarding=true){
 const router=useRouter();
 const [userId,setUserId]=useState<string|null>(null),[profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){router.replace('/auth');setLoading(false);return}
   setUserId(user.id);
   const filter=`id.eq.${user.id},auth_user_id.eq.${user.id}`;
   let {data,error}=await supabase.from('profiles').select('id,username,full_name,campus,hostel,onboarding_completed,avatar_url').or(filter).maybeSingle();
   // Keep existing accounts functional until the optional avatar migration is applied.
   if(error&&/avatar_url|column .* does not exist/i.test(error.message)){
     const legacy=await supabase.from('profiles').select('id,username,full_name,campus,hostel,onboarding_completed').or(filter).maybeSingle();
     data=legacy.data?{...legacy.data,avatar_url:null}:null;error=legacy.error;
   }
   if(error)console.error('GreenFlare profile:',error.message);
   if(needsOnboarding&&(!data?.onboarding_completed)){router.replace('/onboarding');setLoading(false);return}
   setProfile(data as Profile|null);setLoading(false);
 },[needsOnboarding,router]);
 useEffect(()=>{void refresh()},[refresh]);
 return{userId,profile,loading,refresh};
}
