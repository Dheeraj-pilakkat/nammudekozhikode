import Image from "next/image";
import { FaBullhorn } from "react-icons/fa";
import { MdReportGmailerrorred } from "react-icons/md";
import { LuHandHelping } from "react-icons/lu";

export default function Home() {
  return (
    <div className="mx-16 my-4 min-h-screen">
      <div className="flex h-162.5 w-full gap-4 @container flex-col lg:flex-row">
        <div className="relative h-162.5 w-3/4">
          <Image src="/beach1.webp" alt="logo" width={1100} height={300} className="h-[650px] w-full rounded-lg"/>
          <div className="absolute bottom-20 gap-y-5 flex flex-col left-3">
            <h1 className="text-neutral text-5xl font-bold">Build a Smarter </h1> <h1 className="text-neutral text-5xl font-bold"> Kozhikode, Together</h1>
            <p className="text-neutral-500 text-xl ">Report issues, track resolutions, and empower your neighborhood through collective action.</p>
          </div>
        </div>
        <div className="flex flex-col bg-gray-200 gap-y-4 border-t-primary border-t-4 h-full w-1/4 p-9 rounded-lg  items-start justify-evenly px-4">
        <div className="flex items-center gap-x-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <FaBullhorn className="text-2xl text-primary"/>
          </div>
        <h1 className="text-2xl font-semibold">Have a concern in your ward?</h1>
        </div>
        <p className="text-neutral-500 text-xl">Your voice matters. Report infrastructure issues directly to the Corporation in under 60 seconds.</p>
        <button className="bg-primary text-white px-4 py-4 rounded-lg flex items-center justify-center gap-x-2 text-xl w-full">
          <MdReportGmailerrorred />
          Report an Issue
        </button>
        </div>
      </div>
      <div className="@container">
        <div className="flex flex-col justify-center gap-y-4 my-16">
          <h1 className="text-3xl font-bold ">City Highlights</h1>
          <p className="text-xl font-light text-neutral-400">Discover the rich culture and vibrant life of Kozhikode.</p>
        </div>
        <div className="flex justify-evenly  ">
          <div className="bg-neutral-200 h-120 w-96  border-neutral-400 border-2 p-4 rounded flex flex-col gap-y-6 ">
            <div>
              <Image src="/chicken-biriyani.webp" alt="logo" width={300} height={500} className="h-40 w-full rounded"/>
            </div>
            <h2 className="text-xl font-bold">Culinary Heritage</h2>
            <p>The Food Capital of Kerala, famous for its mouth-watering Halwa and iconic Biryani. A melting pot of flavors shaped by centuries of trade.</p>
          </div>
          <div className="bg-neutral-200 h-120 w-96 border-neutral-400 border-2 rounded">
            <h2 className="text-xl font-bold">Cultural Events</h2>
            <p>Join us for exciting cultural celebrations.</p>
          </div>
          <div className="bg-neutral-200 h-120 w-96 border-neutral-400 border-2 rounded">
            <h2 className="text-xl font-bold">Local Cuisine</h2>
            <p>Delight in the flavors of our region.</p>
          </div>
        </div>
      </div>
      <div className="@container flex items-center justify-center ">
        <div className="flex flex-col justify-center gap-y-4 my-16 w-1/2 bg-neutral-200 items-center text-center border-2 border-neutral-400 p-8 rounded-lg py-12">
        <div className="bg-blue-950/20 p-3 rounded-lg"><LuHandHelping className="text-primary text-2xl" /></div>
          <h1 className="text-3xl font-bold ">Preserving our Pride</h1>
          <p className="text-xl font-medium text-neutral-500">Help us maintain the beauty of our historic city. Report issues like broken pavements or faulty streetlights to keep Our Kozhikode clean, safe, and welcoming.</p>
          <button className="bg-primary text-white px-4 py-4 rounded-lg flex items-center justify-center gap-x-2 text-xl w-fit">
          <MdReportGmailerrorred />
          Report an Issue
        </button>
        </div>
      </div>
    </div>
  );
}
