<%@page language="java" pageEncoding="UTF-8" %> 
Bitte die gewünschte Form beachten!
<form action="WorkflowMgmt?<%=request.getQueryString()%>" method="post" enctype="multipart/form-data">
      <label>ZIP-Datei:</label>
      <input type="file" name="workflow" />
      <input type="submit" name="submit" value="Hinzufügen" />
</form>