function projectModule({
  title,
  image,
  techStach,
  client,
  gitHub,
  previewLink,
  description,
  setShowDetails,
}) {
  return (
    <div
      onClick={() => {
        setShowDetails(prev => ({
          ...prev,
          show: true,
          projectDetails: {
            title: title,
            img: image,
            client: client,
            description: description,
            gitHub: gitHub,
            preview: previewLink,
            techStach: techStach,
          },
        }));
      }}
      className=" cursor-pointer flex flex-col gap-1 bg-white p-0 border neon-border border-grey-500 rounded-sm "
    >
      <h3 className="text-gray-900 p-1 ">{title}</h3>
      <img className=" p-1" src={image} alt="" />
      <div className=" flex-wrap p-1 flex  text-[6px] gap-y-1 gap-x-1">
        {techStach?.map((d, i) => {
          return (
            <span
              className="border border-grey-600 rounded-sm text-gray-700 pr-[2px] pl-[2px]"
              key={i}
            >
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default projectModule;
