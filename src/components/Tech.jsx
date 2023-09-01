/* eslint-disable react/no-unescaped-entities */

const Tech = () => {
  return (
    <section
      id="Tech"
      className=" m-auto mt-[250px] mb-[128px] p-6  md:p-24 items-center flex w-[100%] max-w-[1024px] gap-10 border border-gray-500 rounded-lg backdrop-blur-[4px] z-[999]"
    >
      <div className="text-section flex flex-col ">
        <div className=" mt-5 mb-5 flex items-center">
          <h2 className=" flex-[40%] text-2xl text-gray-200">Tech-stack</h2>{' '}
          <span className=" h-[1px] bg-slate-500 w-[100%]" />
          <div className=" md:min-w-[300px] md:min-h-[300px]"></div>
        </div>
      </div>
    </section>
  );
};

export default Tech;
