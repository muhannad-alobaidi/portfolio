/* eslint-disable react/no-unescaped-entities */
const Tech = () => {
  return (
    <section
      id="Tech"
      className=" m-auto mt-[250px] mb-[128px] p-24 items-center flex w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
    >
      <div className="text-section flex flex-col ">
        <div className=" mt-5 mb-5 flex items-center">
          <h2 className=" flex-[40%] text-2xl text-gray-200">Tech-stack</h2>{' '}
          <span className=" h-[1px] bg-slate-500 w-[100%]" />
        </div>
        <div>
          <p className=" mt-3 mb-3 text-gray-400">
            Hi! I'm Muhannad Alobaidi. In 2019, I found my love for web
            development. One day, I came across a cool website that made me
            think, "I want to create something like that!" So, I started
            learning how to code.
          </p>
          <p className=" mt-3 mb-3 text-gray-400">
            Today, I build websites that are easy to use and look good. Every
            new project is a chance for me to bring someone's idea to life on
            the web. I'm always excited Tech what I can create next!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tech;
