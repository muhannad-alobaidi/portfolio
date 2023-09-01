function projectModule({ title, image, plink, glink }) {
  return (
    <div className=" flex flex-col gap-1 bg-white p-0 border neon-border border-grey-500 rounded-sm ">
      <h3 className="text-gray-900 p-1 ">{title}</h3>
      <img className=" p-1" src={image} alt="" />
      <div className="p-1 flex justify-between">
        <a
          target="blank"
          className="border border-grey-600 rounded-sm text-gray-700 text-[8px] p-1"
          href={plink}
        >
          Preview
        </a>
        <a
          target="blank"
          className=" border border-grey-600 rounded-sm text-gray-700 text-[8px] p-1"
          href={glink}
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

export default projectModule;
