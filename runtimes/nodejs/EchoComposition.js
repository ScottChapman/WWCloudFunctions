composer.if(params =>
  {
    return !params.myEvent &&
      params.hasOwnProperty("content") &&
      params.content.toLowerCase().startsWith("can you echo") &&
      params.hasOwnProperty("spaceId")
  },
	composer.sequence(params => {
		return {
			spaceId: params.spaceId,
			title: "From Composer Bot",
			text: "Of course I can!"
		};
	},"WatsonWorkspace/SendMessage")
);
