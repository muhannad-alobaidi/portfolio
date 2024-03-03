function projectModule({ title, image, techStach, previewLink, description }) {
  return (
    <div className={`flex gap-1 p-0 rounded-sm flex-col`}>
      <div className=" flex gap-6 flex-col md:flex-row justify-center md:justify-start items-start md:items-center"  >
        {previewLink ? (
          <a
            className=" hover:shadow-2xl shadow-sm transition-all cursor-pointer h-fit  rounded-2xl border border-zinc-500 "
            href={previewLink}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className=" p-3 w-[200px] rounded-3xl h-32  object-cover"
              src={image}
              alt="img"
            />
          </a>
        ) : (
          <div className=" hover:shadow-2xl shadow-sm transition-all rounded-2xl h-fit border border-zinc-500 ">
            <img
              className=" p-3 w-[200px] rounded-3xl h-32  object-cover"
              src={image}
              alt=""
            />
          </div>
        )}

        <div className=" flex flex-col gap-4 max-w-lg">
          <h3 className="  text-2xl ">{title}</h3>
          <p className=" font-[300] text-[14px]">{description}</p>
          <div className=" flex-wrap flex text-[14px] gap-4">
            {techStach?.map((d, i) => {
              return (
                <span
                  className="border border-grey-600 rounded-lg p-2 leading-none border-zinc-500 font-[100] text-white"
                  key={i}
                >
                  {d}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default projectModule;
