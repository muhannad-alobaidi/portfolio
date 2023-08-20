function projectModule({ title, image, plink, glink }) {
  return (
    <div className=" flex flex-col gap-2 bg-white p-2  border border-grey-500 rounded-lg ">
      <h2 className="text-gray-900 p-2 ">{title}</h2>
      <img className=" p-2" src={image} alt="" />
      <div className="p-2 flex justify-between">
        <a
          target="blank"
          className="border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
          href={plink}
        >
          Preview
        </a>
        <a
          target="blank"
          className=" border border-grey-600 rounded-sm text-gray-700 text-xs p-2"
          href={glink}
        >
          GitHub
        </a>
      </div>
    </div>
  );
}

export default projectModule;
