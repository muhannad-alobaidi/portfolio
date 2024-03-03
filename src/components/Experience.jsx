const Experience = () => {
  return (
    <div>
      <div
        id="work"
        className=" m-auto mt-[100px] mb-[128px]  items-center flex flex-col w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
      >
        <div className="h-auto p-6 w-[100%] ">
          <div className=" w-[100%] mt-5 mb-5 flex items-center">
            <h2 className=" flex-[40%] text-2xl text-gray-200">Experience</h2>{' '}
            <span className=" h-[1px] bg-slate-500 w-[100%]" />
          </div>{' '}
          <div className="h-fit w-full m-auto  flex  ">
            <div className="  gap-16 p-1 md:p-4  pr-0 flex flex-col justify-start ">
              <div className="flex ">
                <div className="flex-[30%]">
                  <span>SEP 2021 - PRESENT</span>
                </div>
                <div className="flex-[70%] flex flex-col gap-4">
                  <h2 className="text-2xl">Junior Web developer - SEK Oy</h2>
                  <p className="font-[300] text-[14px]">
                    {' '}
                    Build, style, and ship high-quality websites, design
                    systems, and digital experiences for a diverse array of
                    projects for clients including Finnair, DNA, Fazer, Sako,
                    Lagerblad Foods, SolarFoods, and more.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'JaveScript',
                      'TypeScript',
                      'HTML',
                      'SCSS',
                      'ReactJS',
                      'NextJs',
                      'WordPress',
                      'PHP',
                      'NodeJs',
                      'Headless CMS',
                      'AWS',
                      'StoryBook',
                    ].map(item => (
                      <span
                        className="border border-grey-600 rounded-lg p-2 leading-none border-zinc-500 font-[100] text-white"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className=" w-[100%] h-[1px] bg-slate-500" />

              <div className="flex ">
                <div className="flex-[30%]">
                  <span>March 2021 - SEP 2021 </span>
                </div>
                <div className="flex-[70%] flex flex-col gap-4">
                  <h2 className="text-2xl"> Web developer trainee - SEK Oy</h2>
                  <p className="font-[300] text-[14px]">
                    {' '}
                    Build, style, and ship high-quality landing pages, and
                    updating & maintaining existing websites and systems for a
                    diverse array of projects for clients including Finnair,
                    DNA, Fazer, Fennia, Nixu, and more.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'JaveScript',
                      'HTML',
                      'SCSS',
                      'ReactJS',
                      'WordPress',
                      'NodeJs',
                      'Dropal',
                    ].map(item => (
                      <span
                        className="border border-grey-600 rounded-lg p-2 leading-none border-zinc-500 font-[100] text-white"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className=" w-[100%] h-[1px] bg-slate-500 " />

              <div className="flex ">
                <div className="flex-[30%]">
                  <span> 2019 - 2020 </span>
                </div>
                <div className="flex-[70%] flex flex-col gap-4">
                  <h2 className="text-2xl">
                    {' '}
                    Game developer - Gilgamish studio{' '}
                  </h2>
                  <p className="font-[300] text-[14px]">
                    {' '}
                    Develop and design games for startup company. Responsible
                    for creating the game’s UI/UX and 3D characters, developing
                    core mechanics, Using Unity game engin and C# programming
                    language.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'Unity',
                      'C#',
                      'Blender',
                      'Game Design',
                      '3D Animation',
                      'PhotoShop',
                    ].map(item => (
                      <span
                        className="border border-grey-600 rounded-lg p-2 leading-none border-zinc-500 font-[100] text-white"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;
