import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const dynamic='force-dynamic';
export async function GET(){try{const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('Unconfigured');const db=createClient(url,key);const {data,error}=await db.from('gf_brand_settings').select('logo_url,favicon_url,preloader_url').eq('id',true).maybeSingle();if(error)throw error;return NextResponse.json(data||{logo_url:null,favicon_url:null,preloader_url:null},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({logo_url:null,favicon_url:null,preloader_url:null},{headers:{'Cache-Control':'no-store'}})}}
