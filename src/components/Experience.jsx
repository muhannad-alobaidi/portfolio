const Experience = () => {
  return (
    <div>
      <div
        id="exprience"
        className=" m-auto mt-[100px] mb-[128px]  items-center flex flex-col w-[100%] max-w-[1024px] gap-10 border border-neon/15 rounded-lg backdrop-blur-[4px] z-[999]"
      >
        <div className="h-auto p-6 w-[100%] ">
          <div className=" w-[100%] mt-5 mb-5 flex items-center px-4 gap-4">
            <h2 className="  text-3xl text-gray-200">EXPERIENCE</h2>{' '}
            <span className=" h-[1px] bg-slate-500 w-[100%]" />
          </div>{' '}
          <div className="h-fit w-full m-auto  flex  ">
            <div className="  gap-16 p-1 md:p-4  pr-0 flex flex-col justify-start ">
              <div className="flex ">
                <div className="flex-[30%]">
                  <span>NOV 2024 - PRESENT</span>
                </div>
                <div className="flex-[70%] flex flex-col gap-4">
                  <h2 className="text-2xl">Front End Developer - SEK Oy</h2>
                  <p className="font-[300] text-[14px]">
                    Build and maintain high-quality websites, AI tools, and
                    digital experiences for a diverse array of projects for
                    clients and in-house projects. Leading the front-end
                    development process from concept to delivery. Utilising
                    modern web technologies to create responsive, accessible,
                    and performant web applications.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {[
                      'JaveScript',
                      'TypeScript',
                      'HTML',
                      'CSS',
                      'ReactJS',
                      'NextJs',
                      'WordPress',
                      'PHP',
                      'NodeJs',
                      'Headless CMS',
                      'AWS',
                      'AI',
                      'GIT',
                      'StoryBook',
                      'Tailwind',
                      'Accessibility',
                      'SEO',
                      'Performance',
                      'Python',
                      'Django',
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
              <div className="flex ">
                <div className="flex-[30%]">
                  <span>SEP 2021 - NOV 2024</span>
                </div>
                <div className="flex-[70%] flex flex-col gap-4">
                  <h2 className="text-2xl">Web developer - SEK Oy</h2>
                  <p className="font-[300] text-[14px]">
                    Build, style, and ship high-quality websites, design
                    systems, and digital experiences for a diverse array of
                    projects for clients.
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
                    Assisted in the development and maintenance of websites,
                    focusing on front-end technologies. Gained hands-on
                    experience in web development best practices and tools.
                    building Landing pages, and small websites for clients using
                    venila HTML, CSS, and JavaScript. Collaborated with senior
                    developers to learn and apply modern web development
                    techniques and tools. Update and maintain existing Nodejs
                    application.
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
