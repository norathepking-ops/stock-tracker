# Stock Tracker — Setup Guide

## ขั้นตอนที่ 1: สร้าง Supabase Project (ฟรี)

1. ไปที่ https://supabase.com → Sign Up (ใช้ Google ได้)
2. กด **New Project**
3. ตั้งชื่อ project (เช่น `stock-tracker`) และตั้ง password
4. รอ 2 นาทีให้ project สร้างเสร็จ
5. ไปที่ **Project Settings → API**
6. Copy:
   - **Project URL** (เช่น `https://xxxx.supabase.co`)
   - **anon public key**

## ขั้นตอนที่ 2: ใส่ Keys ใน `.env.local`

เปิดไฟล์ `.env.local` แล้วแก้ไข:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## ขั้นตอนที่ 3: สร้าง Database

1. ใน Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy code จากไฟล์ `supabase-schema.sql` ทั้งหมด
3. วางใน SQL Editor แล้วกด **Run**

## ขั้นตอนที่ 4: รัน App ในเครื่อง

```bash
cd webull-clone
npm run dev
```

เปิด http://localhost:3000 ในเบราเซอร์

## ขั้นตอนที่ 5: Deploy ขึ้น Vercel (ทำครั้งเดียว ใช้ได้ตลอด)

1. ไปที่ https://vercel.com → Sign Up (ใช้ Google ได้)
2. กด **Add New → Project**
3. Import จาก GitHub หรือ **upload folder** `webull-clone`
4. ใส่ Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL จาก Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Key จาก Supabase
5. กด **Deploy**
6. รับ URL เช่น `https://stock-tracker-xxxx.vercel.app`

หลัง Deploy แล้ว → เปิด URL นี้บนมือถือ → กด **Add to Home Screen** → ได้แอพเลย!

## ฟีเจอร์ที่ทำได้โดยไม่ต้อง Login

- ดู Watchlist (เก็บใน localStorage)
- ดู Stock Detail (Chart, News, Analysis, Technical)
- ดู Market Movers
- ค้นหาหุ้น

## หมายเหตุ

- ข้อมูลหุ้นมาจาก Yahoo Finance (ฟรี, delay ~15 นาที)
- Auto-refresh ทุก 20 วินาที
- รองรับ PWA (ติดตั้งบนมือถือได้)
